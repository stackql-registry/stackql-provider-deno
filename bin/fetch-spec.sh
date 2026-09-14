#!/usr/bin/env bash
# Downloads the Deno Deploy API v2 OpenAPI document into
# provider-dev/downloaded/deno-api-v2.json and prints its version and path
# count. The document is unversioned upstream; the committed copy is the
# record of what was built (the scheduled spec-drift CI job reports changes).
set -euo pipefail
REPO_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
SPEC_URL="${SPEC_URL:-https://api.deno.com/v2/openapi.json}"
SPEC_FILE="$REPO_ROOT/provider-dev/downloaded/deno-api-v2.json"
mkdir -p "$(dirname "$SPEC_FILE")"
curl -fsSL "$SPEC_URL" -o "$SPEC_FILE"
node -e "const s=require('$SPEC_FILE');console.log('spec', s.info.title, s.info.version, 'openapi', s.openapi, 'paths', Object.keys(s.paths).length)"
