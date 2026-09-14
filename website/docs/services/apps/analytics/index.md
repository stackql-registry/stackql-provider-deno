--- 
title: analytics
hide_title: false
hide_table_of_contents: false
keywords:
  - analytics
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

Creates, updates, deletes, gets or lists an <code>analytics</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="analytics" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="deno.apps.analytics" /></td></tr>
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
    <td><CopyableCode code="cpu_seconds" /></td>
    <td><code>number</code></td>
    <td>CPU time consumed, in seconds</td>
</tr>
<tr>
    <td><CopyableCode code="kv_read_units" /></td>
    <td><code>number</code></td>
    <td>Deno KV read units</td>
</tr>
<tr>
    <td><CopyableCode code="kv_write_units" /></td>
    <td><code>number</code></td>
    <td>Deno KV write units</td>
</tr>
<tr>
    <td><CopyableCode code="memory_time_byte_seconds" /></td>
    <td><code>number</code></td>
    <td>Memory usage integrated over time, in byte-seconds</td>
</tr>
<tr>
    <td><CopyableCode code="network_egress_bytes" /></td>
    <td><code>number</code></td>
    <td>Bytes sent</td>
</tr>
<tr>
    <td><CopyableCode code="network_ingress_bytes" /></td>
    <td><code>number</code></td>
    <td>Bytes received</td>
</tr>
<tr>
    <td><CopyableCode code="request_count" /></td>
    <td><code>number</code></td>
    <td>Requests served in the bucket</td>
</tr>
<tr>
    <td><CopyableCode code="runtime_seconds" /></td>
    <td><code>number</code></td>
    <td>Wall-clock runtime, in seconds</td>
</tr>
<tr>
    <td><CopyableCode code="time" /></td>
    <td><code>string (date-time)</code></td>
    <td>Start of the fixed 15-minute UTC bucket</td>
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
    <td><a href="#parameter-since"><code>since</code></a>, <a href="#parameter-until"><code>until</code></a></td>
    <td>Get fixed app-scoped usage analytics in a Deploy Classic-style table envelope.&lt;br /&gt;&lt;br /&gt;The response contains only `fields` and `values`. The current Phase 1 response returns these fields: `time`, `request_count`, `cpu_seconds`, `runtime_seconds`, `memory_time_byte_seconds`, `network_ingress_bytes`, `network_egress_bytes`, `kv_read_units`, and `kv_write_units`. Clients should map row values by `fields&#91;&#93;.name` instead of column position; future responses may include additional fields. Buckets are fixed 15-minute UTC buckets, and only buckets fully contained in the effective `&#91;since, until)` range are returned. Recent buckets may be delayed or updated as telemetry is ingested, and missing rollup rows inside the returned range are zero-filled. Data is available from the analytics rollup rollout time onward and is not invoice-authoritative billing data.</td>
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
<tr id="parameter-since">
    <td><CopyableCode code="since" /></td>
    <td><code>string (date-time)</code></td>
    <td>Inclusive lower bound as a non-empty RFC 3339 timestamp</td>
</tr>
<tr id="parameter-until">
    <td><CopyableCode code="until" /></td>
    <td><code>string (date-time)</code></td>
    <td>Exclusive upper bound as a non-empty RFC 3339 timestamp</td>
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

Get fixed app-scoped usage analytics in a Deploy Classic-style table envelope.&lt;br /&gt;&lt;br /&gt;The response contains only `fields` and `values`. The current Phase 1 response returns these fields: `time`, `request_count`, `cpu_seconds`, `runtime_seconds`, `memory_time_byte_seconds`, `network_ingress_bytes`, `network_egress_bytes`, `kv_read_units`, and `kv_write_units`. Clients should map row values by `fields&#91;&#93;.name` instead of column position; future responses may include additional fields. Buckets are fixed 15-minute UTC buckets, and only buckets fully contained in the effective `&#91;since, until)` range are returned. Recent buckets may be delayed or updated as telemetry is ingested, and missing rollup rows inside the returned range are zero-filled. Data is available from the analytics rollup rollout time onward and is not invoice-authoritative billing data.

```sql
SELECT
cpu_seconds,
kv_read_units,
kv_write_units,
memory_time_byte_seconds,
network_egress_bytes,
network_ingress_bytes,
request_count,
runtime_seconds,
time
FROM deno.apps.analytics
WHERE app = '{{ app }}' -- required
AND since = '{{ since }}'
AND until = '{{ until }}'
;
```
</TabItem>
</Tabs>
