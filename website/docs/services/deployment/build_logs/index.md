--- 
title: build_logs
hide_title: false
hide_table_of_contents: false
keywords:
  - build_logs
  - deployment
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

Creates, updates, deletes, gets or lists a <code>build_logs</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><code>build_logs</code></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="deno.deployment.build_logs" /></td></tr>
</tbody></table>

## Fields

The following fields are returned by `SELECT` queries:

<Tabs
    defaultValue="get_build_logs"
    values={[
        { label: 'get_build_logs', value: 'get_build_logs' }
    ]}
>
<TabItem value="get_build_logs">

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
    <td><CopyableCode code="level" /></td>
    <td><code>string</code></td>
    <td> (example: info)</td>
</tr>
<tr>
    <td><CopyableCode code="message" /></td>
    <td><code>string</code></td>
    <td> (example: Downloaded https://deno.land/std@0.202.0/testing/asserts.ts (2/3))</td>
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
    <td><a href="#get_build_logs"><CopyableCode code="get_build_logs" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-deploymentId"><code>deploymentId</code></a></td>
    <td></td>
    <td>This API returns build logs of the specified deployment. It's useful to watch<br />the build progress, figure out what went wrong in case of a build failure,<br />and so on.<br /><br />The response format can be controlled by the `Accept` header; if<br />`application/x-ndjson` is specified, the response will be a stream of<br />newline-delimited JSON objects. Otherwise it will be a JSON array of<br />objects.</td>
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
<tr id="parameter-deploymentId">
    <td><CopyableCode code="deploymentId" /></td>
    <td><code>string</code></td>
    <td>Deployment ID</td>
</tr>
</tbody>
</table>

## `SELECT` examples

<Tabs
    defaultValue="get_build_logs"
    values={[
        { label: 'get_build_logs', value: 'get_build_logs' }
    ]}
>
<TabItem value="get_build_logs">

This API returns build logs of the specified deployment. It's useful to watch<br />the build progress, figure out what went wrong in case of a build failure,<br />and so on.<br /><br />The response format can be controlled by the `Accept` header; if<br />`application/x-ndjson` is specified, the response will be a stream of<br />newline-delimited JSON objects. Otherwise it will be a JSON array of<br />objects.

```sql
SELECT
level,
message
FROM deno.deployment.build_logs
WHERE deploymentId = '{{ deploymentId }}' -- required;
```
</TabItem>
</Tabs>
