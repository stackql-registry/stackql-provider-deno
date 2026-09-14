# CLAUDE.md

## Project

This repository builds and documents the `deno` provider for [StackQL](https://github.com/stackql/stackql), enabling SQL-based query and provisioning operations against Deno Deploy - apps and their configuration, revisions (deployments) with build logs, build progress and timelines, layers of shared environment variables, custom domains and TLS certificates, database instances, usage analytics and runtime logs.

The provider is a DIRECT build from the Deno Deploy API v2 OpenAPI document (`https://api.deno.com/v2/openapi.json`, OpenAPI 3.1.1, lowered to the 3.0 dialect in a preprocessing step) using the `@stackql/provider-utils` pipeline. Deno has no public GraphQL API, so there is no GraphQL merge step. The v1 Subhosting API the previous provider wrapped is sunset (July 2026) and its tokens no longer work; the v2 token (`ddo_...`) is organization-scoped. The repository follows the same conventions as the sibling `stackql-provider-netlify`, `stackql-provider-github` and `stackql-provider-clickhouse` projects: Makefile-driven pipeline, deterministic mapping scripts, checked-in `all_services.csv`, offline validation plus a meta-route gate, pytest smoke suite in exec and pgwire modes, Docusaurus 3.10 microsite on the shared config.

## Spec source

Deno serves one unversioned document (`info.version` 2.0.0 at the time of the refresh; 23 paths, 34 operations, 45 schemas). `make spec` downloads it to `provider-dev/downloaded/deno-api-v2.json`; `make preprocess` (`provider-dev/scripts/preprocess.mjs`) lowers the 3.1 constructs (`anyOf` nullables and unions, `const`, `examples`, `propertyNames`), drops the deep-object `labels` filter and the SSE response variants, and relaxes required query parameters, writing `provider-dev/downloaded/openapi.json`. Both files are committed so a refresh is a reviewed diff; the scheduled `spec-drift` CI job opens an issue when the served document moves.

## Design principles

- **Terraform env var parity** - auth is `type: bearer` on `DENO_DEPLOY_TOKEN`, the variable the Deno Terraform provider reads. The v2 token is scoped to one organization, so Terraform's `DENO_DEPLOY_ORGANIZATION_ID` has no role here (no path or server variable takes an organization id).
- **Services by API area** - `apps`, `revisions`, `layers`, `domains`, `databases`, mapped from the operationId prefix by `provider-dev/scripts/svc-discriminator.mjs` (fails on an unknown operation). The one override: `apps.deploy` (POST /v2/apps/{app}/deploy) creates a revision, so it is `revisions.deploy`, the INSERT method of the revisions resource.
- **Every resource is selectable except one** - lifecycle operations (cancel, promote, attach / detach a domain, verify, provision) are `exec` methods on the resource they act on. `databases.database_instances` only has a create endpoint upstream, so it is INSERT-only.
- **Bare arrays stay bare** - normalize wraps array-returning list responses in an envelope plus a Go-template transform; `post_normalize.mjs` reverts that for the six Deno list endpoints because stackql iterates bare arrays natively.
- **Pagination is declared, not special-cased** - every service carries `x-stackQL-config.pagination` with the `Link` header `rel="next"` URL (which crosses to the `console.deno.com/api/v2` host and accepts the same token) as the response token and `location: request` for the request token. `apps.runtime_logs.list` overrides that at method level with `cursor` / `$.next_cursor`. `LIMIT` is not pushed down to `limit`; pass `"limit"` in the `WHERE` clause (it is a SQL keyword, so quote it).
- **Predicate pushdown through declared parameters** - `WHERE` columns that match a path or query parameter (`app`, `revision`, `layer`, `domain`, `status`, `layer`, `search`, `since`, `until`, `start`, `"end"`, `level`, `revision_id`, `query`, `step`, `timeline`, `cursor`, `"limit"`) are sent to the API; anything else is filtered locally.
- **snake_case surface for free** - the v2 API is snake_case everywhere, so `snake_case_aliases` and `request.nativeCasing` are not used.
- **Naive request body translation** - every POST/PUT/PATCH gets `requestBodyTranslate.algorithm: naive`, so request body fields are plain columns (no `data__` prefix); object and array fields are JSON strings, booleans are unquoted SQL literals (`production = false`).
- **Streams become rows** - the two JSON Lines endpoints (`revisions.build_logs`, `revisions.build_progress`) bind `application/x-ndjson` and a text transform in `post_process.mjs` walks the body line by line into `{"entries": [...]}` (first 5000 lines); the analytics table envelope is pivoted into one row per bucket the same way.

## Toolchain rules

- Use the **latest** `@stackql/provider-utils` (see [npm](https://www.npmjs.com/package/@stackql/provider-utils)); check for a newer version before starting work.
- Node.js >= 20, `type: module`. The two CLI entry points (`provider-dev-utils.mjs`, `docgen-utils.mjs`) are wrapped as npm scripts invoked through `node`, flags passed after npm's `--`.
- A local `stackql` binary is required for testing (`$STACKQL_BIN`, `./stackql`, or on `PATH`; `bin/start-server.sh` downloads one otherwise). Under WSL point `STACKQL_BIN` at the Linux binary.
- Run the pipeline from Linux, macOS or WSL - the server scripts need `pgrep`/`ps` and the smoke harness downloads a Linux binary.

## Repository layout

```
Makefile                   build / test / docs targets (make help)
bin/                       fetch-spec.sh, start-server.sh (registry-mode local|prod|dev), stop-server.sh, server-status.sh, test-meta-routes.cjs
provider-dev/
  downloaded/              deno-api-v2.json (upstream) + openapi.json (preprocessed), both committed
  source/                  split + normalized per-service specs (generated, committed)
  config/                  all_services.csv (durable operation -> resource map), servers.json, provider_config.json, service_config.json
  scripts/                 preprocess.mjs, svc-discriminator.mjs, post_normalize.mjs, map_operations.mjs, post_process.mjs
  openapi/src/deno/        generated provider (publish this)
  docgen/provider-data/    headerContent1.txt / headerContent2.txt for the docs index page
  test/                    pytest smoke suite (conftest.py, test_tier1.py, tier1.yaml, provider.yaml, cleanup.sh)
tests/                     offline_validation.mjs (SHOW / DESCRIBE against the file registry)
website/                   Docusaurus 3.10 microsite on the shared stackql/docusaurus-config
CLAUDE.md, NOTES.md, README.md
```

## Build pipeline

Every step is deterministic and re-runnable. Manual decisions are rules in scripts, never hand edits to generated files. `make all` runs steps 0-7; `make help` lists the targets.

0. `make spec` / `make preprocess` - download and lower the spec (see Spec source).
1. `make split` - `npm run split` with `--svc-discriminator function --svc-discriminator-fn provider-dev/scripts/svc-discriminator.mjs`.
2. `make normalize` - `npm run normalize` then `post_normalize.mjs` (bare-array revert).
3. `make mappings` - `npm run generate-mappings` (analyze keeps existing CSV rows) then `map_operations.mjs`: fills new operations from its table, prunes retired ones, resyncs moved paths, reports rows that disagree with the table, fails on unmapped operations. The CSV is the durable record of the wiring - do not rename resources or move operations between resources without a documented reason (that is a breaking change for users).
4. `make provider` - `npm run generate-provider` with `--naive-req-body-translate` and the three config JSON files, then `post_process.mjs`.
5. `make test` - `tests/offline_validation.mjs` (no server) then the meta-route gate: starts a local server, walks every `SHOW` / `DESCRIBE EXTENDED` route, stops the server; a failure stops `make all`.
6. `make docs` - docgen into `website/docs/` then `website/scripts/sanitize-docs.mjs` (MDX escaping, upstream anchor rewrite).
7. `make docs-build` - `yarn build` in `website/` (vendors the shared config on `prebuild`).

## Testing

- **Offline validation and meta-route gate** (no credentials): `make test`.
- **Smoke tests** (live, `.env` with `DENO_DEPLOY_TOKEN`): `make smoke-test` runs `provider-dev/test/tier1.yaml` through `stackql exec` (`MODE=pgwire` or `MODE=both` for the Postgres-wire transport). `LIVE=1` runs the same suite against the published provider from the public registry (post-publish verification). The suite creates two `stackql-smoke-*` apps and a layer, deploys one hello-world revision, reads everything it produced, promotes it and deletes everything again; a session-start sweep removes leftovers from an aborted run and `make smoke-cleanup` does the same on demand. Cost is zero on the free tier. The organization's plan allows no custom domains, so domains are read-only in the suite.
- Never point the smoke suite at an organization where a `stackql-smoke-*` app slug is already in use for something real.

## Publishing

Push `provider-dev/openapi/src/deno` to `providers/src` in a feature branch of [`stackql-provider-registry`](https://github.com/stackql/stackql-provider-registry) and follow the registry release flow. Verify with `REGISTRY PULL deno` against the dev registry, then `make smoke-test LIVE=1` once it reaches the public registry.

## Writing conventions

- README and docs copy: measured, precise, no hyperbole. No em dashes; use `-`. No characters not on a QWERTY keyboard; use `->` for arrows. No stacked headings.
- Sample queries are realistic and runnable; nested JSON fields use `json_extract`; JavaScript inside asset content uses single quotes (doubled for SQL) rather than backslash escapes.
- Column and parameter names that are SQL keywords (`"limit"`, `"end"`) are double-quoted in examples.

## Non-negotiables

1. Latest `@stackql/provider-utils`, always.
2. Deterministic scripts, never hand edits to `provider-dev/source`, `provider-dev/openapi` or `all_services.csv`.
3. `all_services.csv` is checked in; an operation moving to a different resource or a resource being renamed is a breaking change and needs a documented reason in NOTES.md.
4. Every regeneration is followed by `make test` before commit; a live `make smoke-test` before publishing.
5. Smoke tests clean up everything they create.
