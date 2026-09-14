--- 
title: runtime_logs
hide_title: false
hide_table_of_contents: false
keywords:
  - runtime_logs
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

Creates, updates, deletes, gets or lists a <code>runtime_logs</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="runtime_logs" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="deno.apps.runtime_logs" /></td></tr>
</tbody></table>

## Fields

The following fields are returned by `SELECT` queries:

<Tabs
    defaultValue="list"
    values={[
        { label: 'list', value: 'list' }
    ]}
>
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
    <td><CopyableCode code="revision_id" /></td>
    <td><code>string</code></td>
    <td>Revision that produced this log entry</td>
</tr>
<tr>
    <td><CopyableCode code="span_id" /></td>
    <td><code>string</code></td>
    <td>OpenTelemetry span ID</td>
</tr>
<tr>
    <td><CopyableCode code="trace_id" /></td>
    <td><code>string</code></td>
    <td>OpenTelemetry trace ID for request correlation</td>
</tr>
<tr>
    <td><CopyableCode code="level" /></td>
    <td><code>string</code></td>
    <td>Log severity level (debug, info, warn, error)</td>
</tr>
<tr>
    <td><CopyableCode code="message" /></td>
    <td><code>string</code></td>
    <td>Log message content</td>
</tr>
<tr>
    <td><CopyableCode code="region" /></td>
    <td><code>string</code></td>
    <td>Region where the isolate was running</td>
</tr>
<tr>
    <td><CopyableCode code="timestamp" /></td>
    <td><code>string</code></td>
    <td>ISO 8601 timestamp of the log entry</td>
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
    <td><a href="#list"><CopyableCode code="list" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-app"><code>app</code></a></td>
    <td><a href="#parameter-start"><code>start</code></a>, <a href="#parameter-end"><code>end</code></a>, <a href="#parameter-revision_id"><code>revision_id</code></a>, <a href="#parameter-level"><code>level</code></a>, <a href="#parameter-query"><code>query</code></a>, <a href="#parameter-cursor"><code>cursor</code></a>, <a href="#parameter-limit"><code>limit</code></a></td>
    <td>Query historical runtime logs, or stream them using Server-Sent Events or JSONL.&lt;br /&gt;&lt;br /&gt;When `end` is specified, returns paginated JSON.&lt;br /&gt;When `end` is omitted, streams logs in real-time using SSE or JSONL.&lt;br /&gt;&lt;br /&gt;Requesting `Accept: application/json` without `end` will return an error.</td>
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
<tr id="parameter-end">
    <td><CopyableCode code="end" /></td>
    <td><code>string (date-time)</code></td>
    <td>End of the time range (ISO 8601). If omitted, logs are streamed in real-time</td>
</tr>
<tr id="parameter-level">
    <td><CopyableCode code="level" /></td>
    <td><code>string</code></td>
    <td>Minimum log severity level</td>
</tr>
<tr id="parameter-limit">
    <td><CopyableCode code="limit" /></td>
    <td><code>integer</code></td>
    <td>The maximum number of items to return</td>
</tr>
<tr id="parameter-query">
    <td><CopyableCode code="query" /></td>
    <td><code>string</code></td>
    <td>Full-text search query</td>
</tr>
<tr id="parameter-revision_id">
    <td><CopyableCode code="revision_id" /></td>
    <td><code>string</code></td>
    <td>Filter logs by revision ID</td>
</tr>
<tr id="parameter-start">
    <td><CopyableCode code="start" /></td>
    <td><code>string (date-time)</code></td>
    <td>Start of the time range (ISO 8601) Required by the API on every request.</td>
</tr>
</tbody>
</table>

## `SELECT` examples

<Tabs
    defaultValue="list"
    values={[
        { label: 'list', value: 'list' }
    ]}
>
<TabItem value="list">

Query historical runtime logs, or stream them using Server-Sent Events or JSONL.&lt;br /&gt;&lt;br /&gt;When `end` is specified, returns paginated JSON.&lt;br /&gt;When `end` is omitted, streams logs in real-time using SSE or JSONL.&lt;br /&gt;&lt;br /&gt;Requesting `Accept: application/json` without `end` will return an error.

```sql
SELECT
revision_id,
span_id,
trace_id,
level,
message,
region,
timestamp
FROM deno.apps.runtime_logs
WHERE app = '{{ app }}' -- required
AND start = '{{ start }}'
AND end = '{{ end }}'
AND revision_id = '{{ revision_id }}'
AND level = '{{ level }}'
AND query = '{{ query }}'
AND cursor = '{{ cursor }}'
AND limit = '{{ limit }}'
;
```
</TabItem>
</Tabs>
