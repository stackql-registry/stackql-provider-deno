---
title: deno
hide_title: false
hide_table_of_contents: false
keywords:
  - deno
  - deno deploy
  - stackql
  - infrastructure-as-code
  - configuration-as-data
  - cloud inventory
  - serverless
  - edge
description: Query, deploy and manage Deno Deploy apps, revisions, layers, environment variables, domains and databases using SQL
custom_edit_url: null
image: /img/stackql-deno-provider-featured-image.png
id: 'provider-intro'
---

import CopyableCode from '@site/src/components/CopyableCode/CopyableCode';

Query, provision and operate Deno Deploy using SQL - apps and their configuration, revisions (deployments) with their build logs, build progress and timelines, layers for shared environment variables, custom domains and TLS certificates, database instances, usage analytics and runtime logs. Built from the Deno Deploy API v2.


:::info[Provider Summary] 

total services: __5__  
total resources: __17__  

:::

See also:
[[` SHOW `]](https://stackql.io/docs/language-spec/show) [[` DESCRIBE `]](https://stackql.io/docs/language-spec/describe)  [[` REGISTRY `]](https://stackql.io/docs/language-spec/registry)
* * *

## Installation

To pull the latest version of the `deno` provider, run the following command:

```bash
REGISTRY PULL deno;
```
> To view previous provider versions or to pull a specific provider version, see [here](https://stackql.io/docs/language-spec/registry).

## Authentication

The following system environment variable is used for authentication by default:

- <CopyableCode code="DENO_DEPLOY_TOKEN" /> - Deno Deploy organization access token (create one in the Deno Deploy console under <b>Settings > Access Tokens</b>; see <a href="https://docs.deno.com/deploy/reference/organizations/">Organizations</a>)

The token is scoped to one organization, so no organization id is needed on queries. This is the same variable name the Deno Terraform provider reads. It is sourced at runtime (from the local machine or as a CI variable/secret).

<details>

<summary>Using different environment variables</summary>

To use different environment variables (instead of the defaults), use the `--auth` flag of the `stackql` program.  For example:

```bash

AUTH='{ "deno": { "type": "bearer",  "credentialsenvvar": "YOUR_DENO_DEPLOY_TOKEN_VAR" }}'
stackql shell --auth="${AUTH}"

```
or using PowerShell:

```powershell

$Auth = "{ 'deno': { 'type': 'bearer',  'credentialsenvvar': 'YOUR_DENO_DEPLOY_TOKEN_VAR' }}"
stackql.exe shell --auth=$Auth

```
</details>

### Using the deno provider with agent assistants (MCP)

StackQL ships an MCP server (`stackql mcp`), so agent assistants such as Claude Code, Claude Desktop, Codex and other MCP clients can query and manage Deno Deploy with SQL.

Store the token in a dotenv file that the server sources at startup:

```bash
mkdir -p ~/.stackql
echo "DENO_DEPLOY_TOKEN=<your-organization-access-token>" > ~/.stackql/deno.env
```

Then register the server with your MCP client. For Claude Code:

```bash
claude mcp add stackql -- stackql mcp --env.file="$HOME/.stackql/deno.env"
```

For Claude Desktop (`claude_desktop_config.json`) or any client configured with JSON:

```json
{
  "mcpServers": {
    "stackql": {
      "command": "stackql",
      "args": ["mcp", "--env.file=/path/to/.stackql/deno.env"]
    }
  }
}
```

The agent can then discover and query Deno Deploy using the server's tools (`list_resources`, `describe_resource`, `run_select_query` and so on). Credential values are resolved inside the server process and are never visible to the agent.

## Example Queries

Try the following queries using `stackql shell`, or run them from a script or CI pipeline with `stackql exec`.

### Apps

Every app in the organization, with its labels and the layers it references. Listings are paginated with a `Link` header and the provider follows it automatically, so a query returns every page:

```sql
SELECT
  id,
  slug,
  labels,
  layers,
  created_at
FROM deno.apps.apps
ORDER BY created_at DESC;
```

A single app by slug or id, with its build and runtime configuration and environment variables expanded from the nested JSON:

```sql
SELECT
  slug,
  json_extract(config, '$.runtime.type') AS runtime_type,
  json_extract(config, '$.runtime.entrypoint') AS entrypoint,
  json_extract(config, '$.framework') AS framework,
  env_vars
FROM deno.apps.apps
WHERE app = 'my-app';
```

Apps that reference a layer (sent to the API as the `layer` parameter), and the same question from the layer's side:

```sql
SELECT id, slug FROM deno.apps.apps WHERE layer = 'shared-secrets';

SELECT id, slug, layer_position FROM deno.layers.layer_apps WHERE layer = 'shared-secrets';
```

Labels are a JSON object; filter on them locally:

```sql
SELECT slug, json_extract(labels, '$.custom.environment') AS environment
FROM deno.apps.apps
WHERE json_extract(labels, '$.custom.environment') = 'production';
```

### Revisions (deployments)

Revisions are listed per app; `status` is sent to the API when supplied:

```sql
SELECT id, status, failure_reason, labels, created_at, build_finished_at
FROM deno.revisions.revisions
WHERE app = 'my-app'
ORDER BY created_at DESC;

SELECT id, created_at
FROM deno.revisions.revisions
WHERE app = 'my-app' AND status = 'failed';
```

Revision ids are globally unique, so a single revision needs no app. The `timelines` column shows where it is routed:

```sql
SELECT id, status, config, env_vars, timelines
FROM deno.revisions.revisions
WHERE revision = '4kv4201c5dfv';
```

Build logs and build progress are JSON Lines streams upstream; the provider turns them into rows (up to the first 5000 log lines):

```sql
SELECT timestamp, level, message, step
FROM deno.revisions.build_logs
WHERE revision = '4kv4201c5dfv' AND step = 'building';

SELECT queued, preparing, installing, building, deploying
FROM deno.revisions.build_progress
WHERE revision = '4kv4201c5dfv';
```

The timelines (deployment targets) a revision is active on, with the hostnames serving it:

```sql
SELECT slug, partition, domains
FROM deno.revisions.timelines
WHERE revision = '4kv4201c5dfv';
```

Build success rate per app, computed locally over the results:

```sql
SELECT
  COUNT(*) AS revisions,
  SUM(status = 'succeeded') AS succeeded,
  ROUND(100.0 * SUM(status = 'succeeded') / COUNT(*), 1) AS success_pct
FROM deno.revisions.revisions
WHERE app = 'my-app';
```

### Layers and environment variables

Layers hold environment variables shared across apps. One row per variable, expanding `env_vars` with `json_each`:

```sql
SELECT id, slug, app_count, created_at
FROM deno.layers.layers;

SELECT
  l.slug AS layer,
  json_extract(v.value, '$.key') AS key,
  json_extract(v.value, '$.secret') AS secret,
  json_extract(v.value, '$.contexts') AS contexts
FROM deno.layers.layers l, json_each(l.env_vars) v
WHERE l.layer = 'shared-secrets'
ORDER BY key;
```

### Domains and certificates

Domains registered to the organization, the DNS records to publish for verification, and the certificate set of one domain:

```sql
SELECT id, domain, kind, is_validated, provisioning_status, dns_records
FROM deno.domains.domains;

SELECT id, kind, subject_alt_names, not_valid_after
FROM deno.domains.certificates
WHERE domain = 'example.com';
```

### Analytics and runtime logs

Usage analytics come back as one row per 15-minute bucket (the API's table envelope is pivoted into columns); `since` and `until` are RFC 3339 timestamps:

```sql
SELECT time, request_count, cpu_seconds, network_egress_bytes, kv_read_units
FROM deno.apps.analytics
WHERE app = 'my-app'
AND since = '2026-09-14T00:00:00Z'
AND until = '2026-09-15T00:00:00Z'
ORDER BY time;
```

Runtime logs for a time window (both bounds are required by the API; `end` is a SQL keyword, so it is double-quoted). Pages are followed through the `cursor` / `next_cursor` pair; `level`, `revision_id` and `query` (full-text search) are sent to the API when supplied. Leave `limit` at its default here: the API's cursor is inclusive of the last row, so consecutive pages share a row and a page size of 1 never advances.

```sql
SELECT timestamp, level, message, revision_id, region
FROM deno.apps.runtime_logs
WHERE app = 'my-app'
AND start = '2026-09-14T00:00:00Z'
AND "end" = '2026-09-14T01:00:00Z'
AND level = 'error';
```

### Provision, mutate and tear down

Mutations use the same SQL grammar: `INSERT` creates, `UPDATE` sends a PATCH, `EXEC` invokes lifecycle methods and `DELETE` removes. Request body fields are supplied as columns using their API names; object and array fields are JSON strings.

Create an app with a runtime configuration and a label, then change its labels:

```sql
INSERT INTO deno.apps.apps (slug, labels, config)
SELECT 'my-app',
  '{"custom.environment": "staging"}',
  '{"runtime": {"type": "dynamic", "entrypoint": "main.ts"}}';

UPDATE deno.apps.apps
SET labels = '{"custom.environment": "production"}'
WHERE app = 'my-app';
```

Deploy a revision from inline source files. The `assets` map is keyed by path; use single quotes inside the JavaScript (doubled for SQL) to avoid escaping. `production` defaults to true; pass `false` to keep the revision off the production timeline, or an object such as `'{"domains": ["preview.example.com"]}'` to bind specific hostnames:

```sql
INSERT INTO deno.revisions.revisions (app, assets, config, labels)
SELECT 'my-app',
  '{"main.ts": {"kind": "file", "encoding": "utf-8", "content": "Deno.serve(() => new Response(''Hello from StackQL''));"}}',
  '{"runtime": {"type": "dynamic", "entrypoint": "main.ts"}}',
  '{"custom.source": "stackql"}';

INSERT INTO deno.revisions.revisions (app, assets, production)
SELECT 'my-app',
  '{"main.ts": {"kind": "file", "content": "Deno.serve(() => new Response(''preview''));"}}',
  false;
```

Builds are asynchronous: poll the revision until `status` is `succeeded` or `failed`, then read `build_logs` for the detail.

Create a layer of shared variables, attach it to an app, and merge in another variable (PATCH `env_vars` is a deep merge; set `delete` to remove one):

```sql
INSERT INTO deno.layers.layers (slug, description, env_vars)
SELECT 'shared-secrets', 'Variables shared by every service',
  '[{"key": "API_URL", "value": "https://api.example.com"}, {"key": "API_KEY", "value": "sk-xxx", "secret": true}]';

UPDATE deno.apps.apps
SET layers = '["shared-secrets"]'
WHERE app = 'my-app';

UPDATE deno.layers.layers
SET env_vars = '[{"key": "CACHE_TTL", "value": "3600", "contexts": ["production"]}]'
WHERE layer = 'shared-secrets';
```

Register a domain, re-run verification once the DNS records are published, and request an automatic certificate:

```sql
INSERT INTO deno.domains.domains (domain, kind)
SELECT 'example.com', 'base_and_wildcard';

EXEC deno.domains.domains.verify @domain = 'example.com';

EXEC deno.domains.certificates.provision @domain = 'example.com';
```

Lifecycle operations are `EXEC` methods on the resource they act on:

```sql
-- make an already-built revision the live production revision
EXEC deno.revisions.revisions.promote @revision = '4kv4201c5dfv';

-- bind hostnames to a revision, and remove one binding
EXEC deno.revisions.revisions.attach_domains @revision = '4kv4201c5dfv'
  @@json = '{"production": ["www.example.com"]}';
EXEC deno.revisions.revisions.detach_domain @revision = '4kv4201c5dfv', @hostname = 'www.example.com';

-- cancel a build in progress
EXEC deno.revisions.revisions.cancel @revision = '4kv4201c5dfv';
```

Tear down (deleting an app deletes its revisions; a layer can only be deleted once no app references it):

```sql
DELETE FROM deno.revisions.revisions WHERE revision = '4kv4201c5dfv';
DELETE FROM deno.apps.apps WHERE app = 'my-app';
DELETE FROM deno.layers.layers WHERE layer = 'shared-secrets';
DELETE FROM deno.domains.domains WHERE domain = 'example.com';
```

`SHOW METHODS IN deno.revisions.revisions` lists every method a resource exposes, including the `EXEC`-only ones, with their required parameters.


## Services
<div class="row">
<div class="providerDocColumn">
<a href="/services/apps/">apps</a><br />
<a href="/services/databases/">databases</a><br />
<a href="/services/domains/">domains</a><br />
</div>
<div class="providerDocColumn">
<a href="/services/layers/">layers</a><br />
<a href="/services/revisions/">revisions</a><br />
</div>
</div>
