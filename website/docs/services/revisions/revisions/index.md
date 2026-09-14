--- 
title: revisions
hide_title: false
hide_table_of_contents: false
keywords:
  - revisions
  - revisions
  - deno
  - infrastructure-as-code
  - configuration-as-data
  - cloud inventory
description: Query, deploy and manage deno resources using SQL
custom_edit_url: null
image: /img/stackql-deno-provider-featured-image.png
---

import CopyableCode from '@site/src/components/CopyableCode/CopyableCode';
import CodeBlock from '@theme/CodeBlock';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Creates, updates, deletes, gets or lists a <code>revisions</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="revisions" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="deno.revisions.revisions" /></td></tr>
</tbody></table>

## Fields

The following fields are returned by `SELECT` queries:

<Tabs
    defaultValue="get"
    values={[
        { label: 'get', value: 'get' },
        { label: 'list', value: 'list' }
    ]}
>
<TabItem value="get">

<table>
<thead>
    <tr>
    <th>Name</th>
    <th>Datatype</th>
    <th>Description</th>
    </tr>
</thead>
<tbody>
<tr>
    <td><CopyableCode code="id" /></td>
    <td><code>string</code></td>
    <td>Unique revision identifier</td>
</tr>
<tr>
    <td><CopyableCode code="build_finished_at" /></td>
    <td><code>string</code></td>
    <td>ISO 8601 timestamp when the build completed, or null if still building</td>
</tr>
<tr>
    <td><CopyableCode code="cancellation_requested_at" /></td>
    <td><code>string</code></td>
    <td>ISO 8601 timestamp when cancellation was requested, or null</td>
</tr>
<tr>
    <td><CopyableCode code="config" /></td>
    <td><code>object</code></td>
    <td>Build and runtime configuration used for this revision</td>
</tr>
<tr>
    <td><CopyableCode code="created_at" /></td>
    <td><code>string</code></td>
    <td>ISO 8601 timestamp of creation</td>
</tr>
<tr>
    <td><CopyableCode code="deleted_at" /></td>
    <td><code>string</code></td>
    <td>ISO 8601 timestamp of deletion, or null if active</td>
</tr>
<tr>
    <td><CopyableCode code="env_vars" /></td>
    <td><code>array</code></td>
    <td>Revision-specific environment variables (immutable once created)</td>
</tr>
<tr>
    <td><CopyableCode code="failure_detail" /></td>
    <td><code>object</code></td>
    <td>Structured detail for a deployment that failed after a successful build (e.g. the application failed to start during warmup), or null. Build failures and cancellations do not carry this detail.</td>
</tr>
<tr>
    <td><CopyableCode code="failure_reason" /></td>
    <td><code>string</code></td>
    <td>Reason for failure, or null if not failed (error, cancelled, timed_out, skipped)</td>
</tr>
<tr>
    <td><CopyableCode code="labels" /></td>
    <td><code>object</code></td>
    <td>Metadata labels attached to this revision (e.g. git info)</td>
</tr>
<tr>
    <td><CopyableCode code="layers" /></td>
    <td><code>array</code></td>
    <td>Layers referenced by this revision, in priority order (later overrides earlier)</td>
</tr>
<tr>
    <td><CopyableCode code="retention" /></td>
    <td><code>string</code></td>
    <td>Garbage-collection policy for this revision. `auto` follows the normal inactivity-based cleanup; `indefinite` exempts the revision from automatic deletion. Only available to enterprise organizations that have opted in to revision retention — contact Deno support to enable it. Absent for organizations without the feature, which cannot set it. Retention only guards against automatic deletion: explicitly deleting the revision, or deleting its app, always succeeds regardless. (auto, indefinite)</td>
</tr>
<tr>
    <td><CopyableCode code="status" /></td>
    <td><code>string</code></td>
    <td>Current revision lifecycle status (skipped, queued, building, succeeded, failed)</td>
</tr>
<tr>
    <td><CopyableCode code="timelines" /></td>
    <td><code>array</code></td>
    <td>Timelines this revision is part of, each with the hostnames that currently route to this revision on that timeline</td>
</tr>
</tbody>
</table>
</TabItem>
<TabItem value="list">

<table>
<thead>
    <tr>
    <th>Name</th>
    <th>Datatype</th>
    <th>Description</th>
    </tr>
</thead>
<tbody>
<tr>
    <td><CopyableCode code="id" /></td>
    <td><code>string</code></td>
    <td>Unique revision identifier</td>
</tr>
<tr>
    <td><CopyableCode code="build_finished_at" /></td>
    <td><code>string</code></td>
    <td>ISO 8601 timestamp when the build completed, or null if still building</td>
</tr>
<tr>
    <td><CopyableCode code="cancellation_requested_at" /></td>
    <td><code>string</code></td>
    <td>ISO 8601 timestamp when cancellation was requested, or null</td>
</tr>
<tr>
    <td><CopyableCode code="created_at" /></td>
    <td><code>string</code></td>
    <td>ISO 8601 timestamp of creation</td>
</tr>
<tr>
    <td><CopyableCode code="deleted_at" /></td>
    <td><code>string</code></td>
    <td>ISO 8601 timestamp of deletion, or null if active</td>
</tr>
<tr>
    <td><CopyableCode code="failure_reason" /></td>
    <td><code>string</code></td>
    <td>Reason for failure, or null if not failed (error, cancelled, timed_out, skipped)</td>
</tr>
<tr>
    <td><CopyableCode code="labels" /></td>
    <td><code>object</code></td>
    <td>Metadata labels attached to this revision</td>
</tr>
<tr>
    <td><CopyableCode code="retention" /></td>
    <td><code>string</code></td>
    <td>Garbage-collection policy (`auto` or `indefinite`). Only present for enterprise organizations opted in to revision retention. (auto, indefinite)</td>
</tr>
<tr>
    <td><CopyableCode code="status" /></td>
    <td><code>string</code></td>
    <td>Current revision lifecycle status (skipped, queued, building, succeeded, failed)</td>
</tr>
</tbody>
</table>
</TabItem>
</Tabs>

## Methods

The following methods are available for this resource:

<table>
<thead>
    <tr>
    <th>Name</th>
    <th>Accessible by</th>
    <th>Required Params</th>
    <th>Optional Params</th>
    <th>Description</th>
    </tr>
</thead>
<tbody>
<tr>
    <td><a href="#get"><CopyableCode code="get" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-revision"><code>revision</code></a></td>
    <td></td>
    <td>Get revision details.&lt;br /&gt;&lt;br /&gt;Revision IDs are globally unique. The response includes `layers`, `env_vars`, and `config` when available.&lt;br /&gt;&lt;br /&gt;Status lifecycle (one of):&lt;br /&gt;- queued -&gt; building -&gt; succeeded (success)&lt;br /&gt;- queued -&gt; failed (build error, cancelled, or timeout)&lt;br /&gt;- queued -&gt; skipped (e.g., commit message contains &#91;skip-ci&#93;)&lt;br /&gt;&lt;br /&gt;The `timelines` field is an eventually consistent view of routing: after a deploy or a domain change it may briefly reflect the previous state (typically for a few seconds at most).</td>
</tr>
<tr>
    <td><a href="#list"><CopyableCode code="list" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-app"><code>app</code></a></td>
    <td><a href="#parameter-cursor"><code>cursor</code></a>, <a href="#parameter-limit"><code>limit</code></a>, <a href="#parameter-status"><code>status</code></a></td>
    <td>List revisions for an app. Optionally filter by status.</td>
</tr>
<tr>
    <td><a href="#deploy"><CopyableCode code="deploy" /></a></td>
    <td><CopyableCode code="insert" /></td>
    <td><a href="#parameter-app"><code>app</code></a>, <a href="#parameter-assets"><code>assets</code></a></td>
    <td></td>
    <td>Create a new revision (deployment).&lt;br /&gt;&lt;br /&gt;Upload source files as assets and optionally specify `config`, `layers`, `env_vars`, and `labels`. Asset keys are relative paths resolved against `/app/src`.&lt;br /&gt;&lt;br /&gt;If `config` is omitted, it is inherited from the app's config. If specified, it fully replaces the app's config (no deep merge).&lt;br /&gt;&lt;br /&gt;Revision `env_vars` are immutable once created and have highest priority in the resolution order. Context filtering is not supported for revision env vars.&lt;br /&gt;&lt;br /&gt;Use `production` and `preview` to control which timelines the revision is deployed to. By default, revisions are deployed to the production timeline only.</td>
</tr>
<tr>
    <td><a href="#update"><CopyableCode code="update" /></a></td>
    <td><CopyableCode code="update" /></td>
    <td><a href="#parameter-revision"><code>revision</code></a></td>
    <td></td>
    <td>Update mutable revision properties. The only mutable property is `retention`, the revision's garbage-collection policy: `auto` follows the normal inactivity-based cleanup, while `indefinite` exempts the revision from automatic deletion so it keeps serving on its preview and pinned-production domains. Explicitly deleting the revision, or deleting its app, is always permitted regardless of `retention`.&lt;br /&gt;&lt;br /&gt;`indefinite` is only available to enterprise organizations that have opted in — contact Deno support to enable it. For organizations without the feature, requests that set `indefinite` fail with `403 REVISION_RETENTION_NOT_AVAILABLE`.</td>
</tr>
<tr>
    <td><a href="#delete"><CopyableCode code="delete" /></a></td>
    <td><CopyableCode code="delete" /></td>
    <td><a href="#parameter-revision"><code>revision</code></a></td>
    <td></td>
    <td>Delete a revision. Cannot delete revisions that are currently building or actively routed.</td>
</tr>
<tr>
    <td><a href="#cancel"><CopyableCode code="cancel" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-revision"><code>revision</code></a></td>
    <td></td>
    <td>Request cancellation of a build in progress. Cancellation is asynchronous — this endpoint returns immediately with the current revision state. The `cancellation_requested_at` field will be set, but the revision may still be in `building` status. Poll the revision or use the &#91;/progress&#93;(https:​//api.deno.com/v2/docs#tag/revisions/GET/api/v2/revisions/&#123;revision&#125;/progress) endpoint to wait for the build to reach the `failed` state with `failure_reason: "cancelled"`.</td>
</tr>
<tr>
    <td><a href="#attach_domains"><CopyableCode code="attach_domains" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-revision"><code>revision</code></a></td>
    <td></td>
    <td>Bind domains to this revision. Bindings are scoped to this revision only — other revisions keep their existing routing.&lt;br /&gt;&lt;br /&gt;Each hostname must fall under a domain your organization has already verified, following the same rule and `&#123;variable&#125;` template syntax as the `domains` field on `POST /apps/&#123;app&#125;/deploy` (see its `production`/`preview` documentation).&lt;br /&gt;&lt;br /&gt;You can also (re-)attach this revision to the app's **default** managed domains post-deployment by listing the default-alias template — the same value `POST /apps/&#123;app&#125;/deploy` accepts (e.g. `&#123;deno.app.slug&#125;.&lt;org&gt;.&lt;managed-domain&gt;` under `production`, or the per-revision `&#123;deno.app.slug&#125;-&#123;deno.revision.id&#125;.…` under `preview`). Listing it sets the timeline label on the revision rather than pinning a custom hostname: the default production host floats to the **latest** revision attached this way, while each revision keeps its own default preview host.&lt;br /&gt;&lt;br /&gt;Binding the same hostname to this revision again is a no-op. Use `DELETE /revisions/&#123;revision&#125;/domains/&#123;hostname&#125;` to remove a binding.&lt;br /&gt;&lt;br /&gt;A hostname always resolves to **exactly one** revision. Binding is additive: attaching a hostname to a revision never detaches it from any revision it is already bound to. When a hostname is bound to several revisions, the **most recently created revision wins**.&lt;br /&gt;&lt;br /&gt;Because the newest bound revision always wins, moving a hostname *forward* to a newer revision is just an attach: bind it to the newer revision and that revision immediately takes over routing — you do not detach the old one. Moving a hostname *back* to an older revision is different: re-attaching the older revision has no effect while a newer revision is still bound, so you must explicitly `DELETE` the binding on every newer revision. Detaching the currently-winning revision falls back to the next most recently created revision that is still bound; the hostname only stops routing once its last binding is removed.&lt;br /&gt;&lt;br /&gt;Returns `204 No Content` on success.</td>
</tr>
<tr>
    <td><a href="#detach_domain"><CopyableCode code="detach_domain" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-revision"><code>revision</code></a>, <a href="#parameter-hostname"><code>hostname</code></a></td>
    <td></td>
    <td>Remove this revision's binding for the given hostname. Hostnames are unique, so the binding is identified by hostname alone — the timeline/context is inferred. Pass the same hostname (including any `&#123;variable&#125;` template syntax) that was used to attach it.&lt;br /&gt;&lt;br /&gt;Passing a **default**-alias template detaches the revision from the app's default managed domain instead of removing a custom binding: the default production host rolls back to the next most recently attached revision, and the default preview host for this revision goes offline.&lt;br /&gt;&lt;br /&gt;Detaching one hostname leaves the revision's other hostnames untouched, even when they share a parent domain. Other revisions and app-level custom-domain assignments are not affected. Returns `404` if no binding exists.</td>
</tr>
<tr>
    <td><a href="#promote"><CopyableCode code="promote" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-revision"><code>revision</code></a></td>
    <td></td>
    <td>Make this already-built revision the live production revision without rebuilding. Pins the app's default production timeline to this revision (joining the timeline first if needed), so the default managed production host — and any custom domains assigned to the app's production timeline — route to it, and it runs with the production context's environment variables and databases.&lt;br /&gt;&lt;br /&gt;This differs from attaching the default production alias via `PUT /revisions/&#123;revision&#125;/domains`: that only marks the revision as a production *member* and lets the **newest** member serve, whereas this **pins this specific** revision, so it serves even when it is older than another production revision. To undo, promote a different revision (re-pins) or remove the production override.&lt;br /&gt;&lt;br /&gt;The revision must be built (status `routed`). Returns `204 No Content`.</td>
</tr>
</tbody>
</table>

## Parameters

Parameters can be passed in the `WHERE` clause of a query. Check the [Methods](#methods) section to see which parameters are required or optional for each operation.

<table>
<thead>
    <tr>
    <th>Name</th>
    <th>Datatype</th>
    <th>Description</th>
    </tr>
</thead>
<tbody>
<tr id="parameter-app">
    <td><CopyableCode code="app" /></td>
    <td><code>string</code></td>
    <td>The app ID or slug. App slugs must be 3–32 characters long, may contain only lowercase letters, numbers, and hyphens, cannot contain underscores, must not start or end with a hyphen, must not have consecutive hyphens in positions 3 and 4, and cannot be a reserved slug. App IDs are UUIDs.</td>
</tr>
<tr id="parameter-hostname">
    <td><CopyableCode code="hostname" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr id="parameter-revision">
    <td><CopyableCode code="revision" /></td>
    <td><code>string</code></td>
    <td>Revision ID (globally unique)</td>
</tr>
<tr id="parameter-cursor">
    <td><CopyableCode code="cursor" /></td>
    <td><code>string</code></td>
    <td>The pagination cursor</td>
</tr>
<tr id="parameter-limit">
    <td><CopyableCode code="limit" /></td>
    <td><code>integer</code></td>
    <td>The maximum number of items to return</td>
</tr>
<tr id="parameter-status">
    <td><CopyableCode code="status" /></td>
    <td><code>string</code></td>
    <td>Filter by revision status</td>
</tr>
</tbody>
</table>

## `SELECT` examples

<Tabs
    defaultValue="get"
    values={[
        { label: 'get', value: 'get' },
        { label: 'list', value: 'list' }
    ]}
>
<TabItem value="get">

Get revision details.&lt;br /&gt;&lt;br /&gt;Revision IDs are globally unique. The response includes `layers`, `env_vars`, and `config` when available.&lt;br /&gt;&lt;br /&gt;Status lifecycle (one of):&lt;br /&gt;- queued -&gt; building -&gt; succeeded (success)&lt;br /&gt;- queued -&gt; failed (build error, cancelled, or timeout)&lt;br /&gt;- queued -&gt; skipped (e.g., commit message contains &#91;skip-ci&#93;)&lt;br /&gt;&lt;br /&gt;The `timelines` field is an eventually consistent view of routing: after a deploy or a domain change it may briefly reflect the previous state (typically for a few seconds at most).

```sql
SELECT
id,
build_finished_at,
cancellation_requested_at,
config,
created_at,
deleted_at,
env_vars,
failure_detail,
failure_reason,
labels,
layers,
retention,
status,
timelines
FROM deno.revisions.revisions
WHERE revision = '{{ revision }}' -- required
;
```
</TabItem>
<TabItem value="list">

List revisions for an app. Optionally filter by status.

```sql
SELECT
id,
build_finished_at,
cancellation_requested_at,
created_at,
deleted_at,
failure_reason,
labels,
retention,
status
FROM deno.revisions.revisions
WHERE app = '{{ app }}' -- required
AND cursor = '{{ cursor }}'
AND limit = '{{ limit }}'
AND status = '{{ status }}'
;
```
</TabItem>
</Tabs>


## `INSERT` examples

<Tabs
    defaultValue="deploy"
    values={[
        { label: 'deploy', value: 'deploy' },
        { label: 'Manifest', value: 'manifest' }
    ]}
>
<TabItem value="deploy">

Create a new revision (deployment).&lt;br /&gt;&lt;br /&gt;Upload source files as assets and optionally specify `config`, `layers`, `env_vars`, and `labels`. Asset keys are relative paths resolved against `/app/src`.&lt;br /&gt;&lt;br /&gt;If `config` is omitted, it is inherited from the app's config. If specified, it fully replaces the app's config (no deep merge).&lt;br /&gt;&lt;br /&gt;Revision `env_vars` are immutable once created and have highest priority in the resolution order. Context filtering is not supported for revision env vars.&lt;br /&gt;&lt;br /&gt;Use `production` and `preview` to control which timelines the revision is deployed to. By default, revisions are deployed to the production timeline only.

```sql
INSERT INTO deno.revisions.revisions (
assets,
config,
layers,
env_vars,
labels,
production,
preview,
retention,
app
)
SELECT 
'{{ assets }}' /* required */,
'{{ config }}',
'{{ layers }}',
'{{ env_vars }}',
'{{ labels }}',
'{{ production }}',
'{{ preview }}',
'{{ retention }}',
'{{ app }}'
RETURNING
id,
build_finished_at,
cancellation_requested_at,
config,
created_at,
deleted_at,
env_vars,
failure_detail,
failure_reason,
labels,
layers,
retention,
status,
timelines
;
```
</TabItem>
<TabItem value="manifest">

<CodeBlock language="yaml">{`# Description fields are for documentation purposes
- name: revisions
  props:
    - name: app
      value: "{{ app }}"
      description: Required parameter for the revisions resource.
    - name: assets
      value: "{{ assets }}"
      description: |
        Source files to deploy. Keys are paths relative to \`/app/src\`
    - name: config
      description: |
        Build and runtime config. If omitted, inherited from the app
      value:
        framework: "{{ framework }}"
        install: "{{ install }}"
        build: "{{ build }}"
        predeploy: "{{ predeploy }}"
        runtime:
          type: "{{ type }}"
          entrypoint: "{{ entrypoint }}"
          args:
            - "{{ args }}"
          cwd: "{{ cwd }}"
          spa: {{ spa }}
        crons: {{ crons }}
    - name: layers
      value:
        - "{{ layers }}"
      description: |
        Layers to reference for this revision
    - name: env_vars
      description: |
        Revision-specific environment variables (immutable once created)
      value:
        - key: "{{ key }}"
          value: "{{ value }}"
    - name: labels
      value: "{{ labels }}"
      description: |
        Metadata labels (e.g. git branch, commit SHA)
    - name: production
      value: "{{ production }}"
      description: |
        Whether and how to deploy to the production timeline. \`true\` (the default) or \`{}\` joins production with default wiring — the default \`<app>.<org>\` alias floats to this revision. \`false\` keeps it out of production. \`{ "domains": [...] }\` enters explicit mode: only the listed hostnames are bound (each pinned to this revision), and the default alias is attached only if you list it explicitly as \`{deno.app.slug}.<org>.<base>\`. \`{ "domains": [] }\` attaches nothing. \`{ "databases": [{ "instance": "...", "name": "..." }] }\` binds the listed databases under the Production partition_config (materialised on first use). \`domains\` and \`databases\` may be combined.
      default: true
    - name: preview
      value: "{{ preview }}"
      description: |
        Whether and how to deploy to the preview timeline. \`true\` or \`{}\` joins preview with the default per-revision preview URL. \`false\` (the default) keeps it out. \`{ "domains": [...] }\` binds only the listed hostnames (each pinned to this revision). \`{ "databases": [{ "instance": "...", "name": "..." }] }\` binds the listed databases under the Preview partition_config.
      default: false
    - name: retention
      value: "{{ retention }}"
      description: |
        Garbage-collection policy for the new revision. \`auto\` (the default) follows the normal inactivity-based cleanup; \`indefinite\` exempts it from automatic deletion. \`indefinite\` is only available to enterprise organizations that have opted in to revision retention — contact Deno support to enable it. For organizations without the feature, a deploy that sets \`indefinite\` fails with \`403 REVISION_RETENTION_NOT_AVAILABLE\`.
      valid_values: ['auto', 'indefinite']
      default: auto
`}</CodeBlock>

</TabItem>
</Tabs>


## `UPDATE` examples

<Tabs
    defaultValue="update"
    values={[
        { label: 'update', value: 'update' }
    ]}
>
<TabItem value="update">

Update mutable revision properties. The only mutable property is `retention`, the revision's garbage-collection policy: `auto` follows the normal inactivity-based cleanup, while `indefinite` exempts the revision from automatic deletion so it keeps serving on its preview and pinned-production domains. Explicitly deleting the revision, or deleting its app, is always permitted regardless of `retention`.&lt;br /&gt;&lt;br /&gt;`indefinite` is only available to enterprise organizations that have opted in — contact Deno support to enable it. For organizations without the feature, requests that set `indefinite` fail with `403 REVISION_RETENTION_NOT_AVAILABLE`.

```sql
UPDATE deno.revisions.revisions
SET 
retention = '{{ retention }}'
WHERE 
revision = '{{ revision }}' --required
RETURNING
id,
build_finished_at,
cancellation_requested_at,
config,
created_at,
deleted_at,
env_vars,
failure_detail,
failure_reason,
labels,
layers,
retention,
status,
timelines;
```
</TabItem>
</Tabs>


## `DELETE` examples

<Tabs
    defaultValue="delete"
    values={[
        { label: 'delete', value: 'delete' }
    ]}
>
<TabItem value="delete">

Delete a revision. Cannot delete revisions that are currently building or actively routed.

```sql
DELETE FROM deno.revisions.revisions
WHERE revision = '{{ revision }}' --required
;
```
</TabItem>
</Tabs>


## Lifecycle Methods

<Tabs
    defaultValue="cancel"
    values={[
        { label: 'cancel', value: 'cancel' },
        { label: 'attach_domains', value: 'attach_domains' },
        { label: 'detach_domain', value: 'detach_domain' },
        { label: 'promote', value: 'promote' }
    ]}
>
<TabItem value="cancel">

Request cancellation of a build in progress. Cancellation is asynchronous — this endpoint returns immediately with the current revision state. The `cancellation_requested_at` field will be set, but the revision may still be in `building` status. Poll the revision or use the [/progress](https://api.deno.com/v2/docs#tag/revisions/GET/api/v2/revisions/&#123;revision&#125;/progress) endpoint to wait for the build to reach the `failed` state with `failure_reason: "cancelled"`.

```sql
EXEC deno.revisions.revisions.cancel 
@revision='{{ revision }}' --required
;
```
</TabItem>
<TabItem value="attach_domains">

Bind domains to this revision. Bindings are scoped to this revision only — other revisions keep their existing routing.&lt;br /&gt;&lt;br /&gt;Each hostname must fall under a domain your organization has already verified, following the same rule and `&#123;variable&#125;` template syntax as the `domains` field on `POST /apps/&#123;app&#125;/deploy` (see its `production`/`preview` documentation).&lt;br /&gt;&lt;br /&gt;You can also (re-)attach this revision to the app's **default** managed domains post-deployment by listing the default-alias template — the same value `POST /apps/&#123;app&#125;/deploy` accepts (e.g. `&#123;deno.app.slug&#125;.&lt;org&gt;.&lt;managed-domain&gt;` under `production`, or the per-revision `&#123;deno.app.slug&#125;-&#123;deno.revision.id&#125;.…` under `preview`). Listing it sets the timeline label on the revision rather than pinning a custom hostname: the default production host floats to the **latest** revision attached this way, while each revision keeps its own default preview host.&lt;br /&gt;&lt;br /&gt;Binding the same hostname to this revision again is a no-op. Use `DELETE /revisions/&#123;revision&#125;/domains/&#123;hostname&#125;` to remove a binding.&lt;br /&gt;&lt;br /&gt;A hostname always resolves to **exactly one** revision. Binding is additive: attaching a hostname to a revision never detaches it from any revision it is already bound to. When a hostname is bound to several revisions, the **most recently created revision wins**.&lt;br /&gt;&lt;br /&gt;Because the newest bound revision always wins, moving a hostname *forward* to a newer revision is just an attach: bind it to the newer revision and that revision immediately takes over routing — you do not detach the old one. Moving a hostname *back* to an older revision is different: re-attaching the older revision has no effect while a newer revision is still bound, so you must explicitly `DELETE` the binding on every newer revision. Detaching the currently-winning revision falls back to the next most recently created revision that is still bound; the hostname only stops routing once its last binding is removed.&lt;br /&gt;&lt;br /&gt;Returns `204 No Content` on success.

```sql
EXEC deno.revisions.revisions.attach_domains 
@revision='{{ revision }}' --required 
@@json=
'{
"production": "{{ production }}", 
"preview": "{{ preview }}"
}'
;
```
</TabItem>
<TabItem value="detach_domain">

Remove this revision's binding for the given hostname. Hostnames are unique, so the binding is identified by hostname alone — the timeline/context is inferred. Pass the same hostname (including any `&#123;variable&#125;` template syntax) that was used to attach it.&lt;br /&gt;&lt;br /&gt;Passing a **default**-alias template detaches the revision from the app's default managed domain instead of removing a custom binding: the default production host rolls back to the next most recently attached revision, and the default preview host for this revision goes offline.&lt;br /&gt;&lt;br /&gt;Detaching one hostname leaves the revision's other hostnames untouched, even when they share a parent domain. Other revisions and app-level custom-domain assignments are not affected. Returns `404` if no binding exists.

```sql
EXEC deno.revisions.revisions.detach_domain 
@revision='{{ revision }}' --required, 
@hostname='{{ hostname }}' --required
;
```
</TabItem>
<TabItem value="promote">

Make this already-built revision the live production revision without rebuilding. Pins the app's default production timeline to this revision (joining the timeline first if needed), so the default managed production host — and any custom domains assigned to the app's production timeline — route to it, and it runs with the production context's environment variables and databases.&lt;br /&gt;&lt;br /&gt;This differs from attaching the default production alias via `PUT /revisions/&#123;revision&#125;/domains`: that only marks the revision as a production *member* and lets the **newest** member serve, whereas this **pins this specific** revision, so it serves even when it is older than another production revision. To undo, promote a different revision (re-pins) or remove the production override.&lt;br /&gt;&lt;br /&gt;The revision must be built (status `routed`). Returns `204 No Content`.

```sql
EXEC deno.revisions.revisions.promote 
@revision='{{ revision }}' --required
;
```
</TabItem>
</Tabs>
