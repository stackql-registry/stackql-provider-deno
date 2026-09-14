# Tier 1 / smoke tests

Smoke tests that exercise the provider against the live Deno Deploy API.
Designed for WSL / Linux. The same suite runs in two transport modes and
against two provider sources:

- `exec`   - one-shot `stackql exec --output json` per query
- `pgwire` - long-lived `stackql srv`, queried over Postgres wire (psycopg)
- default  - the locally generated provider (`provider-dev/openapi`)
- `--live` - the published provider from the public StackQL registry
             (`REGISTRY PULL deno` is issued once per session)

## One-time setup

```bash
# from repo root
bash provider-dev/test/bootstrap.sh          # downloads latest stackql into provider-dev/test/.bin/ (or: make smoke-test)
python -m venv provider-dev/test/.venv
source provider-dev/test/.venv/bin/activate
pip install -r provider-dev/test/requirements.txt
```

## Run

The Makefile wraps all of this (`make smoke-test`, `make smoke-test MODE=both`,
`make smoke-test LIVE=1`, `make smoke-cleanup`); the manual form is:

```bash
set -a; source .env; set +a                 # repo-root .env sets DENO_DEPLOY_TOKEN

# exec mode (default), local provider
pytest provider-dev/test/ -v

# pgwire mode
pytest provider-dev/test/ -v --mode=pgwire

# both modes - same suite runs twice
pytest provider-dev/test/ -v --mode=both

# the published provider instead of the local build
pytest provider-dev/test/ -v --live
```

## What the suite does

Creates two `stackql-smoke-*` apps and a layer, exercises the reads (app by
slug and by id, `"limit" = 1` pagination through the `Link` header, layer
env vars through `json_each`, apps referencing a layer), deploys a hello-world
revision from inline assets, waits for the build to finish, reads the
revision, its build logs and build progress (JSON Lines streams turned into
rows), timelines, the pivoted analytics table and the cursor-paginated
runtime logs, promotes the revision with `EXEC`, lists domains, and deletes
everything it created. A session-start sweep removes anything an earlier
aborted run left behind. Cost is zero on the Deno Deploy free tier; the
organization's plan allows no custom domains, so domains are read-only.

## What to edit when

- **Add / change a query**: edit `tier1.yaml`. No Python changes needed.
- **Add a new assertion primitive**: edit `test_tier1.py`.
- **Use different object names**: set `TEST_APP_SLUG`, `TEST_APP_SLUG_B`
  and `TEST_LAYER_SLUG` in the environment (defaults in `provider.yaml`).
  The revision id is captured from the deploy case at run time.
- **Reuse for another provider**: copy this directory, edit `provider.yaml`
  (provider name, registry path, required auth env vars, defaults, derived
  queries) and `tier1.yaml`. The `poll` / `capture` / sweep extensions in
  `test_tier1.py` are provider-agnostic apart from the sweep's table names.

## tier1.yaml shape

```yaml
- name: short_test_id
  sql: |
    SELECT ... WHERE app = '${TEST_APP_SLUG}'
  poll:                                      # optional: re-run until the predicate holds
    until: "r is not None and r['status'] == 'succeeded'"
    timeout_s: 240
    interval_s: 5
  assertions:
    min_rows: 1                              # default 1; set 0 to allow empty
    required_columns: [col_a, col_b]         # must be present on every row
    row_predicates:                          # python exprs, `rows` and `r` in scope
      - "r['col_a'] == 'expected'"
  capture:                                   # optional: store values for later cases
    TEST_REVISION_ID: "r['id']"
```

`${VAR}` substitution looks up `test_env_defaults` and `derived_env` in
`provider.yaml`, values captured by earlier cases, the computed
`${TEST_SINCE}` / `${TEST_UNTIL}` window, then the process environment. Use
it for anything per-environment - do not hard-code ids in `tier1.yaml`.
