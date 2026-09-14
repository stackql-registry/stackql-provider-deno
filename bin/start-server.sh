#!/bin/bash

# Get current directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BASE_DIR="$( cd "$DIR/.." && pwd )"

# Pick up credentials from the project .env if not already exported
# (explicitly exported env always wins - only source when the token is
# absent). The server process needs DENO_DEPLOY_TOKEN at query time.
if [ -z "$DENO_DEPLOY_TOKEN" ] && [ -f "$BASE_DIR/.env" ]; then
  set -a
  . "$BASE_DIR/.env"
  set +a
  echo "Sourced credentials from $BASE_DIR/.env"
fi

# Parse command line arguments
PROVIDER=""
REG_PATH=""
PORT="5444"
VERIFY="false"
REGISTRY_MODE="local"

function display_help() {
  echo "Usage: start-server.sh [OPTIONS]"
  echo "Options:"
  echo "  --provider NAME         Provider name (default: use provider from package.json)"
  echo "  --registry PATH         Path to local registry (default: current directory)"
  echo "  --registry-mode MODE    local (default) = this repo's provider-dev/openapi;"
  echo "                          prod = the official stackql registry (signed, verified);"
  echo "                          dev  = https://registry-dev.stackql.app/providers"
  echo "  --port PORT             Port to run server on (default: 5444)"
  echo "  --verify                Enable signature verification (default: false, local mode only)"
  echo "  --help                  Display this help message"
}

while [[ $# -gt 0 ]]; do
  case $1 in
    --provider)
      PROVIDER="$2"
      shift 2
      ;;
    --registry)
      REG_PATH="$2"
      shift 2
      ;;
    --registry-mode)
      REGISTRY_MODE="$2"
      shift 2
      ;;
    --port)
      PORT="$2"
      shift 2
      ;;
    --verify)
      VERIFY="true"
      shift
      ;;
    --help)
      display_help
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      display_help
      exit 1
      ;;
  esac
done

# If provider not specified, try to get from package.json
if [ -z "$PROVIDER" ]; then
  if [ -f "$BASE_DIR/package.json" ]; then
    PROVIDER=$(grep -o '"name": "stackql-provider-[^"]*"' "$BASE_DIR/package.json" | sed 's/"name": "stackql-provider-//' | sed 's/"//')
  fi
fi

# If registry path not specified, default to provider-dev/openapi - stackql
# expects the registry root to be the directory CONTAINING `src/`, then
# auto-resolves src/<provider>/<version>/provider.yaml underneath it.
if [ -z "$REG_PATH" ]; then
  REG_PATH="$BASE_DIR/provider-dev/openapi"
fi

echo "Using provider: $PROVIDER"
echo "Registry path: $REG_PATH"
echo "Port: $PORT"
echo "Verify signatures: $VERIFY"

# Resolve a stackql binary. Search order:
#   1. $STACKQL_BIN env var (explicit override)
#   2. local ./stackql in this provider directory
#   3. a stackql / stackql.exe found on PATH
#   4. download the right release into $BASE_DIR/stackql
STACKQL_CMD=""
if [ -n "$STACKQL_BIN" ] && [ -x "$STACKQL_BIN" ]; then
  STACKQL_CMD="$STACKQL_BIN"
  echo "Using StackQL from STACKQL_BIN: $STACKQL_CMD"
elif [ -x "$BASE_DIR/stackql" ]; then
  STACKQL_CMD="$BASE_DIR/stackql"
  echo "Using local StackQL: $STACKQL_CMD"
elif command -v stackql >/dev/null 2>&1; then
  STACKQL_CMD="$(command -v stackql)"
  echo "Using StackQL from PATH: $STACKQL_CMD"
elif command -v stackql.exe >/dev/null 2>&1; then
  STACKQL_CMD="$(command -v stackql.exe)"
  echo "Using StackQL from PATH: $STACKQL_CMD"
else
  echo "StackQL binary not found. Downloading..."

  # Determine OS and architecture
  OS=$(uname -s | tr '[:upper:]' '[:lower:]')
  ARCH=$(uname -m)

  # Map architecture to stackql naming
  if [ "$ARCH" = "x86_64" ]; then
    ARCH="amd64"
  elif [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
    ARCH="arm64"
  fi

  # Set download URL based on OS
  if [ "$OS" = "darwin" ]; then
    DOWNLOAD_URL="https://releases.stackql.io/stackql/latest/stackql_darwin_${ARCH}.zip"
  elif [ "$OS" = "linux" ]; then
    DOWNLOAD_URL="https://releases.stackql.io/stackql/latest/stackql_linux_${ARCH}.zip"
  else
    echo "Unsupported OS: $OS"
    echo "Please install stackql manually from https://github.com/stackql/stackql/releases"
    echo "Or set STACKQL_BIN=/path/to/stackql before running this script."
    exit 1
  fi

  # Download and extract
  cd "$BASE_DIR"
  curl -L -o stackql.zip "$DOWNLOAD_URL"
  unzip -o stackql.zip
  rm stackql.zip
  chmod +x stackql
  STACKQL_CMD="$BASE_DIR/stackql"
  echo "StackQL binary downloaded successfully"
fi

# Set registry configuration
case "$REGISTRY_MODE" in
  local)
    if [ "$VERIFY" = "true" ]; then
      REG='{"url": "file://'${REG_PATH}'", "localDocRoot": "'${REG_PATH}'", "verifyConfig": {"nopVerify": false}}'
    else
      REG='{"url": "file://'${REG_PATH}'", "localDocRoot": "'${REG_PATH}'", "verifyConfig": {"nopVerify": true}}'
    fi
    ;;
  prod)
    # Empty REG = let stackql use its default official registry
    # (signed provider docs, signature verification on).
    REG=""
    ;;
  dev)
    REG='{"url": "https://registry-dev.stackql.app/providers", "verifyConfig": {"nopVerify": true}}'
    ;;
  *)
    echo "Unknown --registry-mode: $REGISTRY_MODE (expected local, prod, or dev)"
    exit 1
    ;;
esac

# Check if server is already running
if pgrep -f "stackql.*--pgsrv.port=${PORT}" > /dev/null; then
  echo "StackQL server is already running on port ${PORT}"
  exit 0
fi

# Start the server
cd "$BASE_DIR"
if [ -n "$REG" ]; then
  echo "Starting StackQL server with registry: $REG"
  nohup "$STACKQL_CMD" --registry="${REG}" --pgsrv.port="${PORT}" srv > stackql-server.log 2>&1 &
else
  echo "Starting StackQL server with the default official registry (mode: $REGISTRY_MODE)"
  nohup "$STACKQL_CMD" --pgsrv.port="${PORT}" srv > stackql-server.log 2>&1 &
fi
SERVER_PID=$!

# Check if server started successfully
sleep 2
if ps -p $SERVER_PID > /dev/null; then
  echo "StackQL server started successfully with PID: $SERVER_PID"
  echo "Server log: $BASE_DIR/stackql-server.log"
else
  echo "Failed to start StackQL server. Check log file: $BASE_DIR/stackql-server.log"
  exit 1
fi