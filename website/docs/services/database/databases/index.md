--- 
title: databases
hide_title: false
hide_table_of_contents: false
keywords:
  - databases
  - database
  - deno
  - infrastructure-as-code
  - configuration-as-data
  - cloud inventory
description: Query, deploy and manage deno resources using SQL
custom_edit_url: null
image: /img/stackql-deno-provider-featured-image.png
---

import CopyableCode from '@site/src/components/CopyableCode/CopyableCode';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Creates, updates, deletes, gets or lists a <code>databases</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><code>databases</code></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="deno.database.databases" /></td></tr>
</tbody></table>

## Fields

The following fields are returned by `SELECT` queries:

<Tabs
    defaultValue="list_kv_databases"
    values={[
        { label: 'list_kv_databases', value: 'list_kv_databases' }
    ]}
>
<TabItem value="list_kv_databases">

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
    <td>A KV database ID</td>
</tr>
<tr>
    <td><CopyableCode code="createdAt" /></td>
    <td><code>string (date-time)</code></td>
    <td> (example: 2021-08-01T00:00:00Z)</td>
</tr>
<tr>
    <td><CopyableCode code="description" /></td>
    <td><code>string</code></td>
    <td>A description of this KV database</td>
</tr>
<tr>
    <td><CopyableCode code="organizationId" /></td>
    <td><code>string (uuid)</code></td>
    <td>An organization ID that this KV database belongs to</td>
</tr>
<tr>
    <td><CopyableCode code="updatedAt" /></td>
    <td><code>string (date-time)</code></td>
    <td> (example: 2021-08-01T00:00:00Z)</td>
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
    <td><a href="#list_kv_databases"><CopyableCode code="list_kv_databases" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-organizationId"><code>organizationId</code></a></td>
    <td><a href="#parameter-page"><code>page</code></a>, <a href="#parameter-limit"><code>limit</code></a>, <a href="#parameter-q"><code>q</code></a>, <a href="#parameter-sort"><code>sort</code></a>, <a href="#parameter-order"><code>order</code></a></td>
    <td>This API returns a list of KV databases belonging to the specified organization<br />in a pagenated manner.<br />The URLs for the next, previous, first, and last page are returned in the<br />`Link` header of the response, if any.</td>
</tr>
<tr>
    <td><a href="#create_kv_database"><CopyableCode code="create_kv_database" /></a></td>
    <td><CopyableCode code="insert" /></td>
    <td><a href="#parameter-organizationId"><code>organizationId</code></a></td>
    <td></td>
    <td>This API allows you to create a new KV database under the specified<br />organization. You will then be able to associate the created KV database<br />with a new deployment by specifying the KV database ID in the "Create a<br />deployment" API call.</td>
</tr>
<tr>
    <td><a href="#update_kv_database"><CopyableCode code="update_kv_database" /></a></td>
    <td><CopyableCode code="update" /></td>
    <td><a href="#parameter-databaseId"><code>databaseId</code></a></td>
    <td></td>
    <td></td>
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
<tr id="parameter-databaseId">
    <td><CopyableCode code="databaseId" /></td>
    <td><code>string (uuid)</code></td>
    <td>KV database ID</td>
</tr>
<tr id="parameter-organizationId">
    <td><CopyableCode code="organizationId" /></td>
    <td><code>string (uuid)</code></td>
    <td>Organization ID</td>
</tr>
<tr id="parameter-limit">
    <td><CopyableCode code="limit" /></td>
    <td><code>integer</code></td>
    <td>The maximum number of items to return per page.</td>
</tr>
<tr id="parameter-order">
    <td><CopyableCode code="order" /></td>
    <td><code>string</code></td>
    <td>Sort order, either `asc` or `desc`. Defaults to `asc`.</td>
</tr>
<tr id="parameter-page">
    <td><CopyableCode code="page" /></td>
    <td><code>integer</code></td>
    <td>The page number to return.</td>
</tr>
<tr id="parameter-q">
    <td><CopyableCode code="q" /></td>
    <td><code>string</code></td>
    <td>Query by KV database ID</td>
</tr>
<tr id="parameter-sort">
    <td><CopyableCode code="sort" /></td>
    <td><code>string</code></td>
    <td>The field to sort by. Currently only `created_at` is supported.</td>
</tr>
</tbody>
</table>

## `SELECT` examples

<Tabs
    defaultValue="list_kv_databases"
    values={[
        { label: 'list_kv_databases', value: 'list_kv_databases' }
    ]}
>
<TabItem value="list_kv_databases">

This API returns a list of KV databases belonging to the specified organization<br />in a pagenated manner.<br />The URLs for the next, previous, first, and last page are returned in the<br />`Link` header of the response, if any.

```sql
SELECT
id,
createdAt,
description,
organizationId,
updatedAt
FROM deno.database.databases
WHERE organizationId = '{{ organizationId }}' -- required
AND page = '{{ page }}'
AND limit = '{{ limit }}'
AND q = '{{ q }}'
AND sort = '{{ sort }}'
AND order = '{{ order }}';
```
</TabItem>
</Tabs>


## `INSERT` examples

<Tabs
    defaultValue="create_kv_database"
    values={[
        { label: 'create_kv_database', value: 'create_kv_database' },
        { label: 'Manifest', value: 'manifest' }
    ]}
>
<TabItem value="create_kv_database">

This API allows you to create a new KV database under the specified<br />organization. You will then be able to associate the created KV database<br />with a new deployment by specifying the KV database ID in the "Create a<br />deployment" API call.

```sql
INSERT INTO deno.database.databases (
data__description,
organizationId
)
SELECT 
'{{ description }}',
'{{ organizationId }}'
RETURNING
id,
createdAt,
description,
organizationId,
updatedAt
;
```
</TabItem>
<TabItem value="manifest">

```yaml
# Description fields are for documentation purposes
- name: databases
  props:
    - name: organizationId
      value: string (uuid)
      description: Required parameter for the databases resource.
    - name: description
      value: string
      description: >
        The description of the KV database. If this is `null`, an empty string
will be set.
        
```
</TabItem>
</Tabs>


## `UPDATE` examples

<Tabs
    defaultValue="update_kv_database"
    values={[
        { label: 'update_kv_database', value: 'update_kv_database' }
    ]}
>
<TabItem value="update_kv_database">

No description available.

```sql
UPDATE deno.database.databases
SET 
data__description = '{{ description }}'
WHERE 
databaseId = '{{ databaseId }}' --required
RETURNING
id,
createdAt,
description,
organizationId,
updatedAt;
```
</TabItem>
</Tabs>
