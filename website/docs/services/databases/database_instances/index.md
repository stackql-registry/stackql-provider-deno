--- 
title: database_instances
hide_title: false
hide_table_of_contents: false
keywords:
  - database_instances
  - databases
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

Creates, updates, deletes, gets or lists a <code>database_instances</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="database_instances" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="deno.databases.database_instances" /></td></tr>
</tbody></table>

## Fields

The following fields are returned by `SELECT` queries:

`SELECT` not supported for this resource, use `SHOW METHODS` to view available operations for the resource.


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
    <td><a href="#create"><CopyableCode code="create" /></a></td>
    <td><CopyableCode code="insert" /></td>
    <td><a href="#parameter-slug"><code>slug</code></a>, <a href="#parameter-connection"><code>connection</code></a></td>
    <td></td>
    <td>Create a new database instance owned by the organization. Supported engines: `postgresql` (bring-your-own server), `denokv` (Deno-managed key-value), and `prisma` (Prisma-managed Postgres).</td>
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
</tbody>
</table>

## `INSERT` examples

<Tabs
    defaultValue="create"
    values={[
        { label: 'create', value: 'create' },
        { label: 'Manifest', value: 'manifest' }
    ]}
>
<TabItem value="create">

Create a new database instance owned by the organization. Supported engines: `postgresql` (bring-your-own server), `denokv` (Deno-managed key-value), and `prisma` (Prisma-managed Postgres).

```sql
INSERT INTO deno.databases.database_instances (
slug,
connection
)
SELECT 
'{{ slug }}' /* required */,
'{{ connection }}' /* required */
RETURNING
id,
connection,
created_at,
databases,
engine,
slug
;
```
</TabItem>
<TabItem value="manifest">

<CodeBlock language="yaml">{`# Description fields are for documentation purposes
- name: database_instances
  props:
    - name: slug
      value: "{{ slug }}"
      description: |
        Slug for the new database instance
    - name: connection
      value:
        engine: "{{ engine }}"
        hostname: "{{ hostname }}"
        port: {{ port }}
        username: "{{ username }}"
        password: "{{ password }}"
        certificate: "{{ certificate }}"
        region: "{{ region }}"
`}</CodeBlock>

</TabItem>
</Tabs>
