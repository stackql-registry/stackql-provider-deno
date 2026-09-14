--- 
title: layers
hide_title: false
hide_table_of_contents: false
keywords:
  - layers
  - layers
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

Creates, updates, deletes, gets or lists a <code>layers</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="layers" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="deno.layers.layers" /></td></tr>
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
    <td>Unique layer identifier</td>
</tr>
<tr>
    <td><CopyableCode code="app_count" /></td>
    <td><code>integer</code></td>
    <td>Number of apps that reference this layer</td>
</tr>
<tr>
    <td><CopyableCode code="created_at" /></td>
    <td><code>string</code></td>
    <td>ISO 8601 timestamp of creation</td>
</tr>
<tr>
    <td><CopyableCode code="description" /></td>
    <td><code>string</code></td>
    <td>Optional description of the layer's purpose</td>
</tr>
<tr>
    <td><CopyableCode code="env_vars" /></td>
    <td><code>array</code></td>
    <td>Environment variables defined in this layer</td>
</tr>
<tr>
    <td><CopyableCode code="layers" /></td>
    <td><code>array</code></td>
    <td>Base layers included by this layer, in priority order (later overrides earlier). The including layer's own env vars take precedence over all its bases</td>
</tr>
<tr>
    <td><CopyableCode code="slug" /></td>
    <td><code>string</code></td>
    <td>Human-readable layer slug</td>
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
    <td><code>string</code></td>
    <td>Unique layer identifier</td>
</tr>
<tr>
    <td><CopyableCode code="app_count" /></td>
    <td><code>integer</code></td>
    <td>Number of apps that reference this layer</td>
</tr>
<tr>
    <td><CopyableCode code="created_at" /></td>
    <td><code>string</code></td>
    <td>ISO 8601 timestamp of creation</td>
</tr>
<tr>
    <td><CopyableCode code="description" /></td>
    <td><code>string</code></td>
    <td>Optional description of the layer's purpose</td>
</tr>
<tr>
    <td><CopyableCode code="env_vars" /></td>
    <td><code>array</code></td>
    <td>Environment variables defined in this layer</td>
</tr>
<tr>
    <td><CopyableCode code="layers" /></td>
    <td><code>array</code></td>
    <td>Base layers included by this layer, in priority order (later overrides earlier). The including layer's own env vars take precedence over all its bases</td>
</tr>
<tr>
    <td><CopyableCode code="slug" /></td>
    <td><code>string</code></td>
    <td>Human-readable layer slug</td>
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
    <td><a href="#parameter-layer"><code>layer</code></a></td>
    <td></td>
    <td>Get a layer by ID or slug.&lt;br /&gt;&lt;br /&gt;Slugs cannot contain underscores; IDs always do.</td>
</tr>
<tr>
    <td><a href="#list"><CopyableCode code="list" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td></td>
    <td><a href="#parameter-search"><code>search</code></a>, <a href="#parameter-cursor"><code>cursor</code></a>, <a href="#parameter-limit"><code>limit</code></a></td>
    <td>List all layers in the organization.</td>
</tr>
<tr>
    <td><a href="#create"><CopyableCode code="create" /></a></td>
    <td><CopyableCode code="insert" /></td>
    <td><a href="#parameter-slug"><code>slug</code></a></td>
    <td></td>
    <td>Create a new layer.</td>
</tr>
<tr>
    <td><a href="#update"><CopyableCode code="update" /></a></td>
    <td><CopyableCode code="update" /></td>
    <td><a href="#parameter-layer"><code>layer</code></a></td>
    <td></td>
    <td>Update a layer. This is the key operation for bulk environment variable updates.&lt;br /&gt;&lt;br /&gt;All fields are optional. `env_vars` performs a deep merge with existing variables: update by ID, update by key+contexts match, or create new. Set `delete: true` to remove a variable.&lt;br /&gt;&lt;br /&gt;Running isolates will restart to pick up the new configuration.</td>
</tr>
<tr>
    <td><a href="#delete"><CopyableCode code="delete" /></a></td>
    <td><CopyableCode code="delete" /></td>
    <td><a href="#parameter-layer"><code>layer</code></a></td>
    <td></td>
    <td>Returns 409 Conflict if apps still reference this layer.</td>
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
<tr id="parameter-layer">
    <td><CopyableCode code="layer" /></td>
    <td><code>string</code></td>
    <td>Layer ID or slug. Slugs cannot contain underscores; IDs always do.</td>
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
<tr id="parameter-search">
    <td><CopyableCode code="search" /></td>
    <td><code>string</code></td>
    <td>The search query for filtering</td>
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

Get a layer by ID or slug.&lt;br /&gt;&lt;br /&gt;Slugs cannot contain underscores; IDs always do.

```sql
SELECT
id,
app_count,
created_at,
description,
env_vars,
layers,
slug,
updated_at
FROM deno.layers.layers
WHERE layer = '{{ layer }}' -- required
;
```
</TabItem>
<TabItem value="list">

List all layers in the organization.

```sql
SELECT
id,
app_count,
created_at,
description,
env_vars,
layers,
slug,
updated_at
FROM deno.layers.layers
WHERE search = '{{ search }}'
AND cursor = '{{ cursor }}'
AND limit = '{{ limit }}'
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

Create a new layer.

```sql
INSERT INTO deno.layers.layers (
slug,
description,
layers,
env_vars
)
SELECT 
'{{ slug }}' /* required */,
'{{ description }}',
'{{ layers }}',
'{{ env_vars }}'
RETURNING
id,
app_count,
created_at,
description,
env_vars,
layers,
slug,
updated_at
;
```
</TabItem>
<TabItem value="manifest">

<CodeBlock language="yaml">{`# Description fields are for documentation purposes
- name: layers
  props:
    - name: slug
      value: "{{ slug }}"
      description: |
        Human-readable layer slug
    - name: description
      value: "{{ description }}"
      description: |
        Optional description of the layer's purpose
    - name: layers
      value:
        - "{{ layers }}"
      description: |
        Other layers to include for hierarchical configuration
    - name: env_vars
      description: |
        Environment variables for this layer
      value:
        - key: "{{ key }}"
          value: "{{ value }}"
          secret: {{ secret }}
          contexts: "{{ contexts }}"
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

Update a layer. This is the key operation for bulk environment variable updates.&lt;br /&gt;&lt;br /&gt;All fields are optional. `env_vars` performs a deep merge with existing variables: update by ID, update by key+contexts match, or create new. Set `delete: true` to remove a variable.&lt;br /&gt;&lt;br /&gt;Running isolates will restart to pick up the new configuration.

```sql
UPDATE deno.layers.layers
SET 
slug = '{{ slug }}',
description = '{{ description }}',
layers = '{{ layers }}',
env_vars = '{{ env_vars }}'
WHERE 
layer = '{{ layer }}' --required
RETURNING
id,
app_count,
created_at,
description,
env_vars,
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

Returns 409 Conflict if apps still reference this layer.

```sql
DELETE FROM deno.layers.layers
WHERE layer = '{{ layer }}' --required
;
```
</TabItem>
</Tabs>
