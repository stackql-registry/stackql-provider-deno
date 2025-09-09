--- 
title: backups
hide_title: false
hide_table_of_contents: false
keywords:
  - backups
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

Creates, updates, deletes, gets or lists a <code>backups</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><code>backups</code></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="deno.database.backups" /></td></tr>
</tbody></table>

## Fields

The following fields are returned by `SELECT` queries:

<Tabs
    defaultValue="list_kv_backups"
    values={[
        { label: 'list_kv_backups', value: 'list_kv_backups' },
        { label: 'get_kv_backup', value: 'get_kv_backup' }
    ]}
>
<TabItem value="list_kv_backups">

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
    <td>The ID of the backup</td>
</tr>
<tr>
    <td><CopyableCode code="status" /></td>
    <td><code></code></td>
    <td>The status of a KV database backup.</td>
</tr>
</tbody>
</table>
</TabItem>
<TabItem value="get_kv_backup">

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
    <td>The ID of the backup</td>
</tr>
<tr>
    <td><CopyableCode code="status" /></td>
    <td><code></code></td>
    <td>The status of a KV database backup.</td>
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
    <td><a href="#list_kv_backups"><CopyableCode code="list_kv_backups" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-databaseId"><code>databaseId</code></a></td>
    <td></td>
    <td>This API returns a list of backups of the specified KV database.<br /><br />Note that currently more than one backups are not supported for a single<br />database. So this API will return either an empty list or a list with a<br />single item.</td>
</tr>
<tr>
    <td><a href="#get_kv_backup"><CopyableCode code="get_kv_backup" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-databaseBackupId"><code>databaseBackupId</code></a></td>
    <td></td>
    <td>This API returns the details of the specified database backup.</td>
</tr>
<tr>
    <td><a href="#enable_kv_backup"><CopyableCode code="enable_kv_backup" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-databaseId"><code>databaseId</code></a></td>
    <td></td>
    <td>This API allows you to enable a backup for a KV database. The backup can be<br />stored in your S3 bucket.<br /><br />Currently, only one backup can be enabled per database. When a second backup<br />is being configured, the API will return a `409 Conflict` error.</td>
</tr>
<tr>
    <td><a href="#disable_kv_backup"><CopyableCode code="disable_kv_backup" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-databaseBackupId"><code>databaseBackupId</code></a></td>
    <td></td>
    <td>This API allows you to disable a backup for a KV database.</td>
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
<tr id="parameter-databaseBackupId">
    <td><CopyableCode code="databaseBackupId" /></td>
    <td><code>string (uuid)</code></td>
    <td>KV Backup ID</td>
</tr>
<tr id="parameter-databaseId">
    <td><CopyableCode code="databaseId" /></td>
    <td><code>string (uuid)</code></td>
    <td>KV database ID</td>
</tr>
</tbody>
</table>

## `SELECT` examples

<Tabs
    defaultValue="list_kv_backups"
    values={[
        { label: 'list_kv_backups', value: 'list_kv_backups' },
        { label: 'get_kv_backup', value: 'get_kv_backup' }
    ]}
>
<TabItem value="list_kv_backups">

This API returns a list of backups of the specified KV database.<br /><br />Note that currently more than one backups are not supported for a single<br />database. So this API will return either an empty list or a list with a<br />single item.

```sql
SELECT
id,
status
FROM deno.database.backups
WHERE databaseId = '{{ databaseId }}' -- required;
```
</TabItem>
<TabItem value="get_kv_backup">

This API returns the details of the specified database backup.

```sql
SELECT
id,
status
FROM deno.database.backups
WHERE databaseBackupId = '{{ databaseBackupId }}' -- required;
```
</TabItem>
</Tabs>


## Lifecycle Methods

<Tabs
    defaultValue="enable_kv_backup"
    values={[
        { label: 'enable_kv_backup', value: 'enable_kv_backup' },
        { label: 'disable_kv_backup', value: 'disable_kv_backup' }
    ]}
>
<TabItem value="enable_kv_backup">

This API allows you to enable a backup for a KV database. The backup can be<br />stored in your S3 bucket.<br /><br />Currently, only one backup can be enabled per database. When a second backup<br />is being configured, the API will return a `409 Conflict` error.

```sql
EXEC deno.database.backups.enable_kv_backup 
@databaseId='{{ databaseId }}' --required;
```
</TabItem>
<TabItem value="disable_kv_backup">

This API allows you to disable a backup for a KV database.

```sql
EXEC deno.database.backups.disable_kv_backup 
@databaseBackupId='{{ databaseBackupId }}' --required;
```
</TabItem>
</Tabs>
