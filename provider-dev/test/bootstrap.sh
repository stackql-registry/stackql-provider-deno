#!/usr/bin/env bash
# Downloads the latest stackql binary into provider-dev/test/.bin/
# Designed for WSL / Linux. Idempotent - skips download if binary already present
# unless --force is passed.

set -euo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BIN_DIR="${SCRIPT_DIR}/.bin"
BINARY="${BIN_DIR}/stackql"

FORCE=0
for arg in "$@"; do
  case "$arg" in
    --force) FORCE=1 ;;
    -h|--help)
      echo "Usage: $0 [--force]"
      exit 0
      ;;
  esac
done

if [[ -x "${BINARY}" && "${FORCE}" -eq 0 ]]; then
  echo "stackql already present at ${BINARY}"
  "${BINARY}" --version || true
  exit 0
fi

mkdir -p "${BIN_DIR}"
cd "${BIN_DIR}"

echo "Downloading latest stackql binary..."
curl -sSL https://bit.ly/stackql-zip -o stackql-zip
unzip -o -q stackql-zip
rm -f stackql-zip
chmod +x stackql

echo "stackql installed at ${BINARY}"
"${BINARY}" --version
