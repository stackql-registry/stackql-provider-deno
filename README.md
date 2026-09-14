# `deno` provider for [`stackql`](https://github.com/stackql/stackql)

This repository generates and documents the `deno` provider for StackQL, which lets you query and manage Deno Deploy apps, revisions (deployments), layers and environment variables, custom domains and certificates, database instances, usage analytics and runtime logs with SQL. The provider is built from the Deno Deploy API v2 OpenAPI document using [`@stackql/provider-utils`](https://www.npmjs.com/package/@stackql/provider-utils).

- Provider docs: [deno-provider.stackql.io](https://deno-provider.stackql.io)
- Upstream spec: [api.deno.com/v2/openapi.json](https://api.deno.com/v2/openapi.json) (OpenAPI 3.1, lowered to 3.0 during the build); API reference at [api.deno.com/v2/docs](https://api.deno.com/v2/docs)

The previous build of this provider wrapped the v1 Subhosting API, which Deno sunset in July 2026; the v2 resource model (apps, revisions, layers, timelines) replaces it entirely, so every service and resource name changed. See `NOTES.md` 13.

## Prerequisites

- Node.js 20 or later, npm, and yarn (for the docs site)
- GNU make and a POSIX shell (Linux, macOS or WSL - the server lifecycle scripts use `pgrep`/`ps`)
- Python 3.10 or later (live smoke tests)
- A Deno Deploy organization access token for live queries and smoke tests

## Quick start

```bash
npm install
make all          # spec -> preprocess -> split -> normalize -> mappings -> provider -> test -> docs -> docs-build
make smoke-test   # live queries against api.deno.com (needs .env, see below)
```

`make help` lists every target. The stages are described below and can be run individually.

## Build pipeline

| Target | What it does |
|--------|--------------|
| `make spec` | Downloads the latest OpenAPI document to `provider-dev/downloaded/deno-api-v2.json`. Set `SPEC_REFRESH=0` to build from the committed copy. |
| `make preprocess` | `provider-dev/scripts/preprocess.mjs` lowers the OpenAPI 3.1 constructs (`anyOf` nullables and unions, `const`, `examples`, `propertyNames`) to the 3.0 dialect the toolchain consumes, drops the deep-object `labels` filter and the SSE response variants, and relaxes required query parameters, writing `provider-dev/downloaded/openapi.json`. |
| `make split` | Splits the spec into five per-service yamls under `provider-dev/source/` using the operationId -> service map in `provider-dev/scripts/svc-discriminator.mjs` (fails on an unknown operation). |
| `make normalize` | Runs the provider-utils normalizer (variant merge, opaque object lowering, path-item parameter lifting) and then `post_normalize.mjs`, which reverts the bare-array envelope the normalizer wraps around the six array-returning list endpoints - stackql iterates bare arrays natively. |
| `make mappings` | Regenerates `provider-dev/config/all_services.csv`. `analyze` preserves existing rows; `provider-dev/scripts/map_operations.mjs` fills in operations added upstream from its mapping table, prunes retired operations, resyncs moved paths and reports rows that disagree with the table. The target fails if any operation is unmapped. |
| `make provider` | Generates the provider under `provider-dev/openapi/src/deno/v00.00.00000/` from the CSV with `servers.json`, `provider_config.json` (bearer auth) and `service_config.json` (Link-header pagination), then runs `post_process.mjs` for the JSON Lines stream transforms, the analytics pivot and the runtime-logs cursor pagination the generator cannot express (see below). |
| `make build` | `preprocess` + `split` + `normalize` + `mappings` + `provider`. |
| `make test` | `tests/offline_validation.mjs` (SHOW / DESCRIBE against the file registry, no server) then the meta-route gate: starts a local `stackql srv` against the generated provider, walks every `SHOW SERVICES` / `SHOW RESOURCES` / `SHOW METHODS` / `DESCRIBE EXTENDED` route and stops the server. No credentials needed; a non-zero exit stops `make all`. |
| `make docs` | Generates the Docusaurus markdown into `website/docs/` from the provider plus `provider-dev/docgen/provider-data/headerContent{1,2}.txt`, then runs `website/scripts/sanitize-docs.mjs` (MDX escaping, upstream anchor rewrite). |
| `make docs-build` / `make docs-serve` | `yarn build` / `yarn start` in `website/` (the shared `stackql/docusaurus-config` is vendored on `prebuild`). |
| `make smoke-test` | Live smoke suite (see [Testing](#testing)). `MODE=exec` (default), `pgwire` or `both`; `LIVE=1` targets the published provider. |
| `make smoke-cleanup` | Deletes every `stackql-smoke-*` app, layer and domain from the organization. |
| `make clean` | Removes the generated provider, split source, website build and the downloaded test binary. |

Manual decisions live in scripts, not in hand edits of generated files, so a refresh is a reviewed diff: rerun `make build`, review the changes to `all_services.csv` and `provider-dev/openapi/`, and add mappings for anything `make split` or `make mappings` reports as unmapped. `all_services.csv` is checked in as the durable record of which operation backs which resource and method; renaming a resource or moving an operation between resources is a breaking change for users and needs a note in `NOTES.md`.

## Authentication

The provider uses a bearer token read from `DENO_DEPLOY_TOKEN`, the same variable the Deno Terraform provider uses:

```bash
export DENO_DEPLOY_TOKEN=<your-organization-access-token>
```

Create a token in the Deno Deploy console under **Settings > Access Tokens**. The token is scoped to one organization, so no organization id is needed on queries. To use a different variable name:

```bash
stackql shell --auth='{"deno":{"type":"bearer","credentialsenvvar":"MY_DENO_TOKEN"}}'
```

## Pagination and pushdown

- **Pagination** is declared on every service via `x-stackQL-config.pagination` (from `provider-dev/config/service_config.json`): the response token is the `Link` header's `rel="next"` URL and the request token replaces the whole request URL, so multi-page listings are traversed automatically up to stackql's `--http.response.pageLimit` (default 20 pages). Runtime logs page with `cursor` / `next_cursor` instead, declared on that method.
- **Predicate pushdown** works through operation parameters: any `WHERE` column that matches a declared path or query parameter (`app`, `revision`, `layer`, `domain`, `status`, `search`, `since`, `until`, `start`, `"end"`, `level`, `revision_id`, `query`, `step`, `timeline`, `"limit"`, ...) is sent to the API rather than filtered locally. Other columns are filtered by the SQL engine after the rows are fetched.
- `LIMIT` is not pushed to `limit`; use `"limit"` in the `WHERE` clause (double-quoted, it is a SQL keyword) to control page size.

## Design notes

- **Services by API area.** `apps`, `revisions`, `layers`, `domains` and `databases`, following the operationId prefix. `POST /v2/apps/{app}/deploy` creates a revision, so it is the `INSERT` method of `deno.revisions.revisions`.
- **Every resource but one is selectable.** Lifecycle operations are `EXEC` methods on the resource they act on (`revisions.cancel`, `revisions.promote`, `revisions.attach_domains`, `revisions.detach_domain`, `domains.verify`, `certificates.provision`). `deno.databases.database_instances` is `INSERT`-only because the API has no read endpoint for it.
- **Verbs.** PATCH is `UPDATE`, POST is `INSERT`, DELETE is `DELETE`. Request body fields are plain columns (no `data__` prefix); object and array fields are JSON strings, booleans are unquoted (`production = false`).
- **Transforms** (`provider-dev/scripts/post_process.mjs`): build logs and build progress are JSON Lines streams turned into rows (first 5000 lines); the analytics table envelope is pivoted into one row per 15-minute bucket with a column per metric.
- **snake_case everywhere.** The v2 API is already snake_case, so no casing aliases are needed.

`NOTES.md` records the evidence behind each of these.

## Testing

### Offline validation and meta-route gate (no credentials)

```bash
make test
```

### Live smoke tests

`provider-dev/test/` holds a pytest suite driven by `tier1.yaml`: it creates two `stackql-smoke-*` apps and a layer, reads them (including `"limit" = 1` pagination and `json_each` over layer env vars), deploys a hello-world revision from inline assets, waits for the build, reads the revision's build logs, build progress, timelines, analytics and runtime logs, promotes it with `EXEC`, lists domains, and deletes everything it created. Cost is zero on the Deno Deploy free tier. The same suite runs through `stackql exec` and through a `stackql srv` Postgres-wire session.

```bash
cat > .env <<'EOF'
DENO_DEPLOY_TOKEN=<your-organization-access-token>
EOF

make smoke-test             # local build, exec mode
make smoke-test MODE=both   # exec + pgwire
make smoke-test LIVE=1      # the published provider from the public registry
make smoke-cleanup          # sweep stackql-smoke-* objects
```

The target downloads a Linux `stackql` into `provider-dev/test/.bin/` and creates a venv on first run. Object names are overridable with `TEST_APP_SLUG`, `TEST_APP_SLUG_B` and `TEST_LAYER_SLUG` (defaults in `provider-dev/test/provider.yaml`). See `provider-dev/test/README.md` for the YAML shape and how to add cases.

### Ad hoc queries

```bash
PROVIDER_REGISTRY_ROOT_DIR="$(pwd)/provider-dev/openapi"
REG_STR='{"url": "file://'${PROVIDER_REGISTRY_ROOT_DIR}'", "localDocRoot": "'${PROVIDER_REGISTRY_ROOT_DIR}'", "verifyConfig": {"nopVerify": true}}'
stackql shell --registry="${REG_STR}"
```

```sql
SELECT id, slug, labels, layers, created_at
FROM deno.apps.apps;

SELECT id, status, created_at, build_finished_at
FROM deno.revisions.revisions
WHERE app = 'my-app' AND status = 'succeeded';

SELECT timestamp, level, message, step
FROM deno.revisions.build_logs
WHERE revision = '<revision-id>';
```

More examples, including deploying a revision from inline source, layers and env vars, analytics and the mutation grammar, are in the [provider docs](https://deno-provider.stackql.io) (source: `provider-dev/docgen/provider-data/headerContent2.txt`).

## Publishing the provider

Push the `provider-dev/openapi/src/deno` directory to `providers/src` in a feature branch of [`stackql-provider-registry`](https://github.com/stackql/stackql-provider-registry) and follow the [registry release flow](https://github.com/stackql/stackql-provider-registry/blob/dev/docs/build-and-deployment.md). To verify the dev registry build:

```bash
export DEV_REG="{ \"url\": \"https://registry-dev.stackql.app/providers\" }"
stackql --registry="${DEV_REG}" shell
```

```sql
registry pull deno;
```

Once the provider reaches the public registry, `make smoke-test LIVE=1` runs the same smoke suite against it.

## Publishing the docs

`make docs` regenerates `website/docs/`; commit the regenerated tree. Doc pages show a "Last updated" date taken from git history (`showLastUpdateTime` in `website/docusaurus.config.js`), so pages carry the date of the commit that last regenerated them. Pushes to `main` that touch `website/**` deploy to GitHub Pages via `.github/workflows/prod-web-deploy.yml`; the custom domain is `deno-provider.stackql.io` (CNAME to `stackql.github.io`).

## Repository layout

```
Makefile                         build / test / docs targets
bin/                             fetch-spec, server lifecycle scripts, meta-route test
provider-dev/
  downloaded/                    deno-api-v2.json (upstream) + openapi.json (preprocessed)
  source/                        split + normalized per-service specs (generated)
  config/                        all_services.csv mappings, servers / auth / pagination json
  scripts/                       preprocess, svc-discriminator, post_normalize, map_operations, post_process
  openapi/src/deno/              generated provider (publish this)
  docgen/provider-data/          headerContent1.txt / headerContent2.txt for the docs index page
  test/                          pytest smoke tests
tests/                           offline validation
website/                         Docusaurus microsite
CLAUDE.md                        working conventions for the build
NOTES.md                         engineering notes and evidence
```

## License

MIT

## Contributing

Contributions are welcome. Please open a pull request.
