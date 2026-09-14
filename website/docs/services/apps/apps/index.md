--- 
title: apps
hide_title: false
hide_table_of_contents: false
keywords:
  - apps
  - apps
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

Creates, updates, deletes, gets or lists an <code>apps</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="apps" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="deno.apps.apps" /></td></tr>
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
    <td><code>string (uuid)</code></td>
    <td>Unique app identifier (UUID)</td>
</tr>
<tr>
    <td><CopyableCode code="config" /></td>
    <td><code>object</code></td>
    <td>Default build and runtime configuration for new revisions</td>
</tr>
<tr>
    <td><CopyableCode code="created_at" /></td>
    <td><code>string</code></td>
    <td>ISO 8601 timestamp of creation</td>
</tr>
<tr>
    <td><CopyableCode code="env_vars" /></td>
    <td><code>array</code></td>
    <td>App-specific environment variables</td>
</tr>
<tr>
    <td><CopyableCode code="labels" /></td>
    <td><code>object</code></td>
    <td>User-defined key-value labels for filtering and grouping</td>
</tr>
<tr>
    <td><CopyableCode code="layers" /></td>
    <td><code>array</code></td>
    <td>Layers referenced by this app, in priority order (later overrides earlier)</td>
</tr>
<tr>
    <td><CopyableCode code="slug" /></td>
    <td><code>string</code></td>
    <td>Human-readable app slug. App slugs must be 3–32 characters long, may contain only lowercase letters, numbers, and hyphens, cannot contain underscores, must not start or end with a hyphen, must not have consecutive hyphens in positions 3 and 4, and cannot be a reserved slug.</td>
</tr>
<tr>
    <td><CopyableCode code="updated_at" /></td>
    <td><code>string</code></td>
    <td>ISO 8601 timestamp of last modification</td>
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
    <td><code>string (uuid)</code></td>
    <td>Unique app identifier (UUID)</td>
</tr>
<tr>
    <td><CopyableCode code="created_at" /></td>
    <td><code>string</code></td>
    <td>ISO 8601 timestamp of creation</td>
</tr>
<tr>
    <td><CopyableCode code="labels" /></td>
    <td><code>object</code></td>
    <td>User-defined key-value labels</td>
</tr>
<tr>
    <td><CopyableCode code="layers" /></td>
    <td><code>array</code></td>
    <td>Layers referenced by this app, in priority order (later overrides earlier)</td>
</tr>
<tr>
    <td><CopyableCode code="slug" /></td>
    <td><code>string</code></td>
    <td>Human-readable app slug. App slugs must be 3–32 characters long, may contain only lowercase letters, numbers, and hyphens, cannot contain underscores, must not start or end with a hyphen, must not have consecutive hyphens in positions 3 and 4, and cannot be a reserved slug.</td>
</tr>
<tr>
    <td><CopyableCode code="updated_at" /></td>
    <td><code>string</code></td>
    <td>ISO 8601 timestamp of last modification</td>
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
    <td><a href="#parameter-app"><code>app</code></a></td>
    <td></td>
    <td>Get detailed information about an app, including labels, layers, environment variables, and config.</td>
</tr>
<tr>
    <td><a href="#list"><CopyableCode code="list" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td></td>
    <td><a href="#parameter-cursor"><code>cursor</code></a>, <a href="#parameter-limit"><code>limit</code></a>, <a href="#parameter-layer"><code>layer</code></a></td>
    <td>List apps with optional filtering by labels or layer.&lt;br /&gt;&lt;br /&gt;Use `labels&#91;key&#93;=value` query parameters to filter by label values. Use `layer` to filter apps that reference a specific layer.</td>
</tr>
<tr>
    <td><a href="#create"><CopyableCode code="create" /></a></td>
    <td><CopyableCode code="insert" /></td>
    <td></td>
    <td></td>
    <td>Apps can reference layers for shared configuration, have app-specific environment variables, and a config that provides defaults for revisions.</td>
</tr>
<tr>
    <td><a href="#update"><CopyableCode code="update" /></a></td>
    <td><CopyableCode code="update" /></td>
    <td><a href="#parameter-app"><code>app</code></a></td>
    <td></td>
    <td>All fields are optional. `labels` and `layers` replace the entire value. `env_vars` performs a deep merge with existing variables. `config` replaces the entire deploy config (no deep merge).&lt;br /&gt;&lt;br /&gt;Updating `layers` or `env_vars` will restart running isolates.</td>
</tr>
<tr>
    <td><a href="#delete"><CopyableCode code="delete" /></a></td>
    <td><CopyableCode code="delete" /></td>
    <td><a href="#parameter-app"><code>app</code></a></td>
    <td></td>
    <td>Delete an app and all its revisions.</td>
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
<tr id="parameter-cursor">
    <td><CopyableCode code="cursor" /></td>
    <td><code>string</code></td>
    <td>The pagination cursor</td>
</tr>
<tr id="parameter-layer">
    <td><CopyableCode code="layer" /></td>
    <td><code>string</code></td>
    <td>Layer ID or slug. Slugs cannot contain underscores; IDs always do.</td>
</tr>
<tr id="parameter-limit">
    <td><CopyableCode code="limit" /></td>
    <td><code>integer</code></td>
    <td>The maximum number of items to return</td>
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

Get detailed information about an app, including labels, layers, environment variables, and config.

```sql
SELECT
id,
config,
created_at,
env_vars,
labels,
layers,
slug,
updated_at
FROM deno.apps.apps
WHERE app = '{{ app }}' -- required
;
```
</TabItem>
<TabItem value="list">

List apps with optional filtering by labels or layer.&lt;br /&gt;&lt;br /&gt;Use `labels&#91;key&#93;=value` query parameters to filter by label values. Use `layer` to filter apps that reference a specific layer.

```sql
SELECT
id,
created_at,
labels,
layers,
slug,
updated_at
FROM deno.apps.apps
WHERE cursor = '{{ cursor }}'
AND limit = '{{ limit }}'
AND layer = '{{ layer }}'
;
```
</TabItem>
</Tabs>


## `INSERT` examples

<Tabs
    defaultValue="create"
    values={[
        { label: 'create', value: 'create' },
        { label: 'Manifest', value: 'manifest' }
    ]}
>
<TabItem value="create">

Apps can reference layers for shared configuration, have app-specific environment variables, and a config that provides defaults for revisions.

```sql
INSERT INTO deno.apps.apps (
slug,
labels,
layers,
env_vars,
config
)
SELECT 
'{{ slug }}',
'{{ labels }}',
'{{ layers }}',
'{{ env_vars }}',
'{{ config }}'
RETURNING
id,
config,
created_at,
env_vars,
labels,
layers,
slug,
updated_at
;
```
</TabItem>
<TabItem value="manifest">

<CodeBlock language="yaml">{`# Description fields are for documentation purposes
- name: apps
  props:
    - name: slug
      value: "{{ slug }}"
      description: |
        App slug. If omitted, a random slug is generated. App slugs must be 3–32 characters long, may contain only lowercase letters, numbers, and hyphens, cannot contain underscores, must not start or end with a hyphen, must not have consecutive hyphens in positions 3 and 4, and cannot be a reserved slug.
    - name: labels
      value: "{{ labels }}"
      description: |
        Key-value labels for filtering and grouping (max 5)
    - name: layers
      value:
        - "{{ layers }}"
      description: |
        Layers to reference for inherited configuration
    - name: env_vars
      description: |
        App-specific environment variables
      value:
        - key: "{{ key }}"
          value: "{{ value }}"
          secret: {{ secret }}
          contexts: "{{ contexts }}"
    - name: config
      description: |
        Default build and runtime configuration
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

All fields are optional. `labels` and `layers` replace the entire value. `env_vars` performs a deep merge with existing variables. `config` replaces the entire deploy config (no deep merge).&lt;br /&gt;&lt;br /&gt;Updating `layers` or `env_vars` will restart running isolates.

```sql
UPDATE deno.apps.apps
SET 
slug = '{{ slug }}',
labels = '{{ labels }}',
layers = '{{ layers }}',
env_vars = '{{ env_vars }}',
config = '{{ config }}'
WHERE 
app = '{{ app }}' --required
RETURNING
id,
config,
created_at,
env_vars,
labels,
layers,
slug,
updated_at;
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

Delete an app and all its revisions.

```sql
DELETE FROM deno.apps.apps
WHERE app = '{{ app }}' --required
;
```
</TabItem>
</Tabs>
