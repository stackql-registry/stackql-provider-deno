#!/usr/bin/env bash
# Sweeps every stackql-smoke-* app, layer and domain from the organization the
# DENO_DEPLOY_TOKEN in the environment belongs to, using the locally generated
# provider (or the published one with --live). Idempotent; safe to run when
# there is nothing to sweep. Wired to `make smoke-cleanup`.
set -euo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"
BIN="$SCRIPT_DIR/.bin/stackql"
PREFIX="stackql-smoke"
LIVE=0
for arg in "$@"; do
  case "$arg" in
    --live) LIVE=1 ;;
    -h|--help) echo "Usage: $0 [--live]"; exit 0 ;;
  esac
done

if [ ! -x "$BIN" ]; then
  echo "stackql binary not found at $BIN - run bash provider-dev/test/bootstrap.sh first"
  exit 2
fi
if [ -z "${DENO_DEPLOY_TOKEN:-}" ]; then
  echo "DENO_DEPLOY_TOKEN is not set"
  exit 2
fi

REG_ARGS=()
if [ "$LIVE" -eq 0 ]; then
  ROOT="$REPO_ROOT/provider-dev/openapi"
  REG_ARGS=(--registry "{\"url\":\"file://$ROOT\",\"localDocRoot\":\"$ROOT\",\"verifyConfig\":{\"nopVerify\":true}}")
else
  "$BIN" exec "REGISTRY PULL deno;" >/dev/null
fi

q() { "$BIN" exec "${REG_ARGS[@]}" --output json "$1"; }
names() { python3 -c 'import json,sys; d=json.load(sys.stdin) or []; print("\n".join(str(r.get(sys.argv[1],"")) for r in d if str(r.get(sys.argv[1],"")).startswith(sys.argv[2])))' "$2" "$PREFIX"; }

echo "== sweeping $PREFIX-* apps =="
for slug in $(q "SELECT id, slug FROM deno.apps.apps" | names - slug); do
  echo "  deleting app $slug"
  q "UPDATE deno.apps.apps SET layers = '[]' WHERE app = '$slug'" >/dev/null || true
  q "DELETE FROM deno.apps.apps WHERE app = '$slug'" >/dev/null
done
echo "== sweeping $PREFIX-* layers =="
for slug in $(q "SELECT id, slug FROM deno.layers.layers" | names - slug); do
  echo "  deleting layer $slug"
  q "DELETE FROM deno.layers.layers WHERE layer = '$slug'" >/dev/null
done
echo "== sweeping $PREFIX-* domains =="
for d in $(q "SELECT id, domain FROM deno.domains.domains" | names - domain); do
  echo "  deleting domain $d"
  q "DELETE FROM deno.domains.domains WHERE domain = '$d'" >/dev/null
done
echo "sweep complete"
