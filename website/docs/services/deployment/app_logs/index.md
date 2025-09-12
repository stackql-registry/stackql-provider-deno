--- 
title: app_logs
hide_title: false
hide_table_of_contents: false
keywords:
  - app_logs
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

Creates, updates, deletes, gets or lists an <code>app_logs</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><code>app_logs</code></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="deno.deployment.app_logs" /></td></tr>
</tbody></table>

## Fields

The following fields are returned by `SELECT` queries:

<Tabs
    defaultValue="get_app_logs"
    values={[
        { label: 'get_app_logs', value: 'get_app_logs' }
    ]}
>
<TabItem value="get_app_logs">

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
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="message" /></td>
    <td><code>string</code></td>
    <td> (example: log message)</td>
</tr>
<tr>
    <td><CopyableCode code="region" /></td>
    <td><code>string</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="time" /></td>
    <td><code>string (date-time)</code></td>
    <td>Log timestamp (example: 2021-08-01T00:00:00Z)</td>
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
    <td><a href="#get_app_logs"><CopyableCode code="get_app_logs" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-deploymentId"><code>deploymentId</code></a></td>
    <td><a href="#parameter-q"><code>q</code></a>, <a href="#parameter-level"><code>level</code></a>, <a href="#parameter-region"><code>region</code></a>, <a href="#parameter-since"><code>since</code></a>, <a href="#parameter-until"><code>until</code></a>, <a href="#parameter-limit"><code>limit</code></a>, <a href="#parameter-sort"><code>sort</code></a>, <a href="#parameter-order"><code>order</code></a>, <a href="#parameter-cursor"><code>cursor</code></a></td>
    <td>This API can return either past logs or real-time logs depending on the<br />presence of the since and until query parameters; if at least one of them<br />is provided, past logs are returned, otherwise real-time logs are returned.<br /><br />Also, the response format can be controlled by the `Accept` header; if<br />`application/x-ndjson` is specified, the response will be a stream of<br />newline-delimited JSON objects. Otherwise it will be a JSON array of<br />objects.</td>
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
<tr id="parameter-cursor">
    <td><CopyableCode code="cursor" /></td>
    <td><code>string</code></td>
    <td>Opaque value that represents the cursor of the last log returned in the previous request.  This is only effective for the past log mode.</td>
</tr>
<tr id="parameter-level">
    <td><CopyableCode code="level" /></td>
    <td><code>string</code></td>
    <td>Log level(s) to filter logs by.  Defaults to all levels (i.e. no filter applied).  Multiple levels can be specified using comma-separated format. (example: error,warning)</td>
</tr>
<tr id="parameter-limit">
    <td><CopyableCode code="limit" /></td>
    <td><code>integer</code></td>
    <td>Maximum number of logs to return in one request.  This is only effective for the past log mode.</td>
</tr>
<tr id="parameter-order">
    <td><CopyableCode code="order" /></td>
    <td><code>string</code></td>
    <td>Sort order, either `asc` or `desc`. Defaults to `desc`.  For backward compatibility, `timeAsc` and `timeDesc` are also supported, but deprecated.  This is only effective for the past log mode.</td>
</tr>
<tr id="parameter-q">
    <td><CopyableCode code="q" /></td>
    <td><code>string</code></td>
    <td>Text to search for in log message. (example: foobar)</td>
</tr>
<tr id="parameter-region">
    <td><CopyableCode code="region" /></td>
    <td><code>string</code></td>
    <td>Region(s) to filter logs by.  Defaults to all regions (i.e. no filter applied).  Multiple regions can be specified using comma-separated format. (example: gcp-us-central1,gcp-us-east1)</td>
</tr>
<tr id="parameter-since">
    <td><CopyableCode code="since" /></td>
    <td><code>string (date-time)</code></td>
    <td>Start time of the time range to filter logs by.  Defaults to the Unix Epoch (though the log retention period is 2 weeks as of now).  If neither `since` nor `until` is specified, real-time logs are returned. (example: 2021-08-01T00:00:00Z)</td>
</tr>
<tr id="parameter-sort">
    <td><CopyableCode code="sort" /></td>
    <td><code>string</code></td>
    <td>The field to sort by. Currently only `time` is supported.  This is only effective for the past log mode.</td>
</tr>
<tr id="parameter-until">
    <td><CopyableCode code="until" /></td>
    <td><code>string (date-time)</code></td>
    <td>End time of the time range to filter logs by.  Defaults to the current time.  If neither `since` nor `until` is specified, real-time logs are returned. (example: 2021-08-01T00:00:00Z)</td>
</tr>
</tbody>
</table>

## `SELECT` examples

<Tabs
    defaultValue="get_app_logs"
    values={[
        { label: 'get_app_logs', value: 'get_app_logs' }
    ]}
>
<TabItem value="get_app_logs">

This API can return either past logs or real-time logs depending on the<br />presence of the since and until query parameters; if at least one of them<br />is provided, past logs are returned, otherwise real-time logs are returned.<br /><br />Also, the response format can be controlled by the `Accept` header; if<br />`application/x-ndjson` is specified, the response will be a stream of<br />newline-delimited JSON objects. Otherwise it will be a JSON array of<br />objects.

```sql
SELECT
level,
message,
region,
time
FROM deno.deployment.app_logs
WHERE deploymentId = '{{ deploymentId }}' -- required
AND q = '{{ q }}'
AND level = '{{ level }}'
AND region = '{{ region }}'
AND since = '{{ since }}'
AND until = '{{ until }}'
AND limit = '{{ limit }}'
AND sort = '{{ sort }}'
AND order = '{{ order }}'
AND cursor = '{{ cursor }}'
;
```
</TabItem>
</Tabs>
