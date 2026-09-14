# Engineering Notes

Findings from the 2026-09 refresh of the `deno` provider. The previous build (September 2025) wrapped the Deno Deploy v1 Subhosting API (`https://api.deno.com/v1`, organizations / projects / deployments / KV databases) with `@stackql/provider-utils` 0.4.x. Sources for this refresh: the upstream v2 document (`info.version` 2.0.0, fetched 2026-09-14), the any-sdk and stackql source trees (`any-sdk` v0.5.5-alpha01, the version `stackql` v0.11.669 pins), the any-sdk template engine run standalone under Go 1.26, live calls against `api.deno.com`, and the netlify / clickhouse / datadog sibling builds.

## 1. Why the v2 API

Deno announced the sunset of the v1 Subhosting API for 20 July 2026 and moved to the Deno Deploy API v2 (`https://api.deno.com/v2`, OpenAPI at `/v2/openapi.json`). The credentials for this project are v2 credentials: the token carries the `ddo_` prefix (v1 tokens were `ddp_`) and the organization identifier is a slug, not the UUID v1 required. A v1 call with the v2 token returns `401 invalidToken`; a v2 call succeeds. The resource model changed wholesale (projects -> apps, deployments -> revisions, plus layers, timelines and labels), so the provider was rebuilt rather than refreshed: every service and resource name is new (see 13).

The v2 document is OpenAPI 3.1.1 with 23 paths, 34 operations (tags `apps`, `revisions`, `layers`, `domains`, `databases`; the `environment variables` tag carries no operations) and 45 schemas.

## 2. OpenAPI 3.1 lowering (preprocess)

`@stackql/provider-utils` and stackql's loader (any-sdk on kin-openapi) consume the 3.0 dialect, so `provider-dev/scripts/preprocess.mjs` rewrites the document before the split. Counts from the current document:

| Rule | Count |
|---|---|
| `anyOf [X, {type: null}]` -> `X` + `nullable: true` | 27 |
| single remaining variant merged into the parent (`$ref` becomes `allOf: [{$ref}]`) | 27 |
| variants that are all the same scalar collapsed (`LayerRefInput`, `DeployDatabaseRef.instance`) | 2 |
| variants that are all objects kept as `oneOf` for the normalizer to merge (`Asset`, `DatabaseInstanceConnection`, the `RevisionProgress` stage unions) | 30 |
| mixed scalar / object unions lowered to `type: string` with a "JSON value" note (`ProductionTarget`, `PreviewTarget`, `Labels` values, `contexts` on the env var schemas) | 7 |
| `const` -> `enum` | 44 |
| `examples` -> `example` | 25 |
| `propertyNames` dropped | 8 |
| `enum` without `type` given one | 36 |

Two document-specific rules: the `labels` query parameter on `GET /v2/apps` is removed (the API expects deep-object `labels[key]=value` pairs, which a single-valued SQL predicate cannot express; filter on the `labels` column with `json_extract`), and the `text/event-stream` variant of the two streaming responses is dropped so the generator binds `application/x-ndjson` (see 6). The `openapi: 3.1.1` version string is kept: the clickhouse provider ships the same and both kin-openapi and the docgen's swagger-parser accept it.

## 3. Service split

Services follow the operationId prefix (`apps.`, `revisions.`, `layers.`, `domains.`, `databases.`) through a function discriminator (`provider-dev/scripts/svc-discriminator.mjs`) that fails on an unknown operationId. One override: `apps.deploy` (`POST /v2/apps/{app}/deploy`) returns a `Revision` and is documented as "create a new revision", so it lives in the `revisions` service as the INSERT method `revisions.deploy` - the same shape as netlify's `deploys.create`.

## 4. Pagination (Link header and cursors)

The list endpoints (`apps.list`, `revisions.list`, `layers.list`, `layers.apps`, `domains.list`) page with `cursor` / `limit` query parameters and an RFC 8288 `Link` header, 30 items per page by default. `provider-dev/config/service_config.json` declares the netlify config at the root of every service document (`x-stackQL-config.pagination`, `responseToken: {key: Link, location: header}`, `requestToken: {key: '', location: request}`); any-sdk v0.5.5 recognises a header-located `Link` token and replaces the request URL with the `rel="next"` URL (`internal/anysdk/operation_store.go` `isLinkHeaderPagination`).

Live finding: the `next` URL is absolute but on a different host - `https://console.deno.com/api/v2/apps?cursor=...&limit=1` - and that host accepts the same bearer token, so the traversal works unchanged. Verified with two apps and `"limit" = 1`: `SELECT count(*) FROM deno.apps.apps WHERE "limit" = 1` returns the same count as the unpaged listing (smoke case `pagination_follows_link_header`). `limit` is a SQL keyword and must be double-quoted.

`GET /v2/apps/{app}/logs` (runtime logs) has no `Link` header; it returns `{logs: [...], next_cursor: ...}`. `post_process.mjs` sets a method-level `config.pagination` (`requestToken: cursor` in the query, `responseToken: $.next_cursor` in the body) that overrides the service-level Link config, plus `objectKey: $.logs`. Upstream quirk, verified with curl: the cursor is the base64 timestamp of the last row and the next page starts at that timestamp inclusive, so consecutive pages share one row and a page size of 1 never advances (the same row and cursor come back forever; stackql stops at `--http.response.pageLimit`). With the default page size (100) the overlap is one row per page boundary; leave `"limit"` alone on runtime logs, or add `DISTINCT`.

`LIMIT` is not pushed to `limit` (no `queryParamPushdown.top`): the page loop does not stop early once a LIMIT is satisfied, so a smaller page size only multiplies requests (the netlify decision).

## 5. Bare-array list responses

Six endpoints return a top-level JSON array (`apps.list`, `revisions.list`, `revisions.timelines`, `layers.list`, `layers.apps`, `domains.list`). `normalize` (provider-utils 0.7.x) wraps those in `{<key>: [...]}` plus a Go-template transform; `post_normalize.mjs` (copied from the netlify build) reverts that because stackql iterates bare arrays natively. Verified live on every list resource.

## 6. JSON Lines streams (build logs, build progress)

`GET /v2/revisions/{revision}/build_logs` and `/progress` only offer `text/event-stream` and `application/x-ndjson`. Live facts: the API returns JSON Lines whatever the `Accept` header (even `application/json`), the chunked stream terminates cleanly (curl exit 0, no gzip on these endpoints), and a finished hello-world build is 15 log lines and one progress snapshot.

any-sdk sends `Accept: <response.mediaType>` (`internal/anysdk/request.go`), so the method binds `application/x-ndjson`; a `transform` with `overrideMediaType: application/json`, a `schema_override` naming a synthetic `{entries: [...]}` wrapper and `objectKey: $.entries` turns the body into rows. Three engine facts shaped the template (`pkg/stream_transform`):

- `getRegexpAllMatches(input, pattern)` returns the capture groups of the FIRST match (`FindStringSubmatch`), not every match, and errors when the pattern has no group - so it cannot split lines.
- The text reader returns the whole body together with `io.EOF`, and `Transform()` breaks on `io.EOF` before checking the execution error, so a failing template is silent: the output is whatever was emitted before the failure (`{"entries":[`), which the JSON decoder reports as `unexpected EOF`. Keep the stream templates free of calls that can fail.
- The JSON reader creates a new `json.Decoder` per read, so it cannot iterate a multi-object body either.

The working template walks the body with a cursor: `getRegexpFirstMatch $rest "^([^\n]*)"` reads the current line, `slice` / `plus1` / `len` advance past it, and a seed regex of 5000 empty capture groups matched against `""` supplies the loop bound (text/template cannot count; Go's regexp repeat limit of 1000 rules out `{n}` counters). Each step is O(line): 88 ms for a 5000-line, 870 KB synthetic body in the standalone engine (an earlier `(?s)^[^\n]*\n?(.*)$` variant was O(lines x body) and took 56 s on 3000 lines). Bodies longer than 5000 lines are truncated to the first 5000 rows. CRLF, blank lines, a missing trailing newline and an empty body were all verified.

`build_logs.list` accepts `step` and `timeline` as pushed-down filters. The progress stream stays open while a build is running, so `build_progress` on an in-flight revision blocks until the build reaches a terminal state (or the HTTP timeout).

## 7. Analytics pivot

`GET /v2/apps/{app}/analytics` returns a table envelope `{fields: [{name, type}], values: [[...]]}`. A `values` column cannot be selected by name (the stackql parser rejects the keyword even quoted - the netlify finding) and column-per-metric is what a user wants, so `post_process.mjs` attaches a JSON transform that pivots each row of `values` into an object keyed by `fields[].name` under `{"rows": [...]}` with `objectKey: $.rows`. The synthetic schema lists the documented Phase 1 fields (`time`, `request_count`, `cpu_seconds`, `runtime_seconds`, `memory_time_byte_seconds`, `network_ingress_bytes`, `network_egress_bytes`, `kv_read_units`, `kv_write_units`); the transform emits whatever the API returns, so a new field becomes a column once it is added to `ANALYTICS_FIELDS`. Live: fixed 15-minute UTC buckets, zero-filled, for a `[since, until)` window; a three-hour window on a new app returned 11 rows.

## 8. Required query parameters

`start` on `GET /v2/apps/{app}/logs` is the only required query parameter in the document. stackql does not register a required query parameter as a WHERE symbol: `WHERE start = ...` (quoted or not, and after renaming the parameter to `since`) fails with `could not locate symbol start`, while dropping `required: true` makes both spellings work. `preprocess.mjs` therefore relaxes every required query parameter at the SQL surface and appends "Required by the API on every request." to its description; the API still enforces it (`400 MALFORMED_REQUEST ... at start` without it). `end` is a SQL keyword and is double-quoted in queries; `start` is not.

## 9. Casing

The v2 API is snake_case in every path parameter, query parameter, request body attribute and response field ("All field names use snake_case" in the document). Nothing to alias: `snake_case_aliases`, `request.nativeCasing` and `--update-path-param-names` are not used.

## 10. Request bodies

`--naive-req-body-translate` puts `requestBodyTranslate.algorithm: naive` on all ten POST/PUT/PATCH methods with a body, so body fields are plain columns. Object and array fields (`labels`, `layers`, `env_vars`, `config`, `assets`, `production`, `preview`) are JSON strings; any-sdk parses a string value as a JSON object or array when it can (`internal/anysdk/shims.go` `parseRequestBodyParam`) and otherwise sends the string. Two consequences verified live:

- `production = 'false'` is sent as the string `"false"` and rejected (`400 Invalid input at production`); the unquoted SQL literal `production = false` and the object form `production = '{"domains": []}'` are both accepted. The docs use the unquoted form.
- A SQL string literal is backslash-escaped by the parser, so JavaScript with `\"` inside `assets` arrives as invalid JSON and is sent as a string (`400 expected record, received string at assets`). Writing the JavaScript with single quotes, doubled for SQL (`new Response(''Hello'')`), round-trips cleanly.

No `x-stackQL-stringOnly` marks are needed: none of the string-typed body fields (`slug`, `description`, `certificate`, `private_key`, ...) plausibly carry JSON-shaped values.

## 11. Auth

`type: bearer` on `DENO_DEPLOY_TOKEN` - the variable the Deno Terraform provider reads (`denoland/deno` 0.1.0, which targets the v1 API). The v2 token is created under the organization's Settings > Access Tokens and is scoped to that organization, so Terraform's `DENO_DEPLOY_ORGANIZATION_ID` has no counterpart: no v2 path or server takes an organization id. The `.env` for this project carries both variables; only the token is read.

## 12. Verb mapping and lifecycle operations

GET collection -> `select` (`list`), GET single -> `select` (`get`), POST -> `insert`, PATCH -> `update`, DELETE -> `delete`. `PUT /v2/revisions/{revision}/domains` binds hostnames and is the `exec` method `attach_domains`; `DELETE .../domains/{hostname}` is `detach_domain`. `cancel`, `promote` (revisions), `verify` (domains) and `provision` (certificates) are `exec` methods on their resource. Method dispatch for `EXEC` is by method key, so a method listed under `methods:` but not referenced from `sqlVerbs` is EXEC-able, which is exactly what the generator writes for `stackql_verb = exec`.

`domains.uploadCertificate` (POST, returns the domain) is `certificates.upload` (INSERT) and `domains.listCertificates` (`{certificates: [...], provisioning_status}`) is `certificates.list` with `objectKey: $.certificates`, so the certificates resource is selectable. `databases.createInstance` is the only database endpoint, so `databases.database_instances` is INSERT-only and the one non-selectable resource (the meta-route gate reports it).

## 13. Breaking changes from the 2025 provider

Everything. The v1 provider had services `organization`, `project`, `deployment`, `domain`, `database` with resources such as `project.projects`, `deployment.deployments`, `database.backups`, camelCase parameters (`organizationId`, `projectId`) and page-number pagination; none of those API endpoints exist in v2 and the v1 endpoints are sunset. The v2 provider has services `apps`, `revisions`, `layers`, `domains`, `databases` (12 resources, 34 methods). `all_services.csv` is now committed as the durable record of the wiring; future refreshes must not move an operation to a different resource or rename a resource without a note here.

## 14. Live verification (2026-09-14)

The smoke suite (`make smoke-test MODE=both`, 32 cases x 2 transports) passed 64/64 in 3 minutes against the `stackql` organization (free plan) with the locally generated provider; the hello-world build completed within the first poll interval. Ad hoc verification through `stackql exec` covered the same ground plus:

- reads: apps (list, get by slug, get by id), revisions (list with `status` pushdown, get), build logs (15 rows, `GROUP BY step`), build progress, timelines, analytics (11 buckets), runtime logs (`start` / `"end"`, `level` pushdown, `"limit"`), layers (list, get, `json_each` over `env_vars`), layer apps, domains (empty)
- pagination via `"limit" = 1` across two apps (Link header to `console.deno.com`)
- app lifecycle: INSERT (slug, labels, config) -> UPDATE labels and layers -> DELETE
- layer lifecycle: INSERT with env vars -> UPDATE (deep-merged env var) -> DELETE (after detaching from the app)
- revision lifecycle: INSERT (inline `assets`, `config`, `labels`; `production = false`; `production = '{"domains": []}'`) -> build succeeded within seconds -> `EXEC ... promote`

Plan limits found on the way: `POST /v2/domains` returns `400 CUSTOM_DOMAIN_LIMIT_EXCEEDED` ("Your plan includes 0 custom domains"), so the domain lifecycle, certificate upload and ACME provisioning were not exercised and the smoke suite only lists domains. `POST /v2/database_instances` was not exercised either (a database instance is a standing resource with no delete endpoint). Both are mapped from the document and pass the meta-route gate.

The API returned transient `502 Server Error` pages twice during the session (app create, deploy); a retry succeeded.

## Open

- `revisions.update` (`retention: indefinite`) is an enterprise opt-in and was not exercised.
- `certificates.upload` / `certificates.provision` and `database_instances.create` need an organization with the matching plan features to be verified live.
- The 5000-line cap on the JSON Lines transforms is a template-engine limitation (no split function, no counting); a `lines` or `split` template function in any-sdk would remove it.
- stackql not registering required query parameters as WHERE symbols (8) looks like a binary defect; if it is fixed upstream the preprocess rule can go and `start` can be declared required again.
