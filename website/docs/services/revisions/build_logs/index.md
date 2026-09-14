--- 
title: build_logs
hide_title: false
hide_table_of_contents: false
keywords:
  - build_logs
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

Creates, updates, deletes, gets or lists a <code>build_logs</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="build_logs" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="deno.revisions.build_logs" /></td></tr>
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
    <td><CopyableCode code="step" /></td>
    <td><code>string</code></td>
    <td>Build step that produced this log (e.g. `preparing`, `installing`, `building`) (preparing, installing, building, deploying)</td>
</tr>
<tr>
    <td><CopyableCode code="timeline" /></td>
    <td><code>string</code></td>
    <td>Timeline slug, if the log is associated with a specific timeline</td>
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
    <td><a href="#parameter-revision"><code>revision</code></a></td>
    <td><a href="#parameter-step"><code>step</code></a>, <a href="#parameter-timeline"><code>timeline</code></a></td>
    <td>Stream build logs for a revision.&lt;br /&gt;&lt;br /&gt;Supports both Server-Sent Events (SSE) (`Accept: text/event-stream`) and JSON Lines (`Accept: application/x-ndjson`) formats. Use the `Accept` header to specify the desired format.&lt;br /&gt;&lt;br /&gt;The stream remains open during active builds and closes when the build completes.</td>
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
<tr id="parameter-revision">
    <td><CopyableCode code="revision" /></td>
    <td><code>string</code></td>
    <td>Revision ID (globally unique)</td>
</tr>
<tr id="parameter-step">
    <td><CopyableCode code="step" /></td>
    <td><code>string</code></td>
    <td>Filter logs by build step</td>
</tr>
<tr id="parameter-timeline">
    <td><CopyableCode code="timeline" /></td>
    <td><code>string</code></td>
    <td>Filter logs by timeline slug</td>
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

Stream build logs for a revision.&lt;br /&gt;&lt;br /&gt;Supports both Server-Sent Events (SSE) (`Accept: text/event-stream`) and JSON Lines (`Accept: application/x-ndjson`) formats. Use the `Accept` header to specify the desired format.&lt;br /&gt;&lt;br /&gt;The stream remains open during active builds and closes when the build completes.

```sql
SELECT
level,
message,
step,
timeline,
timestamp
FROM deno.revisions.build_logs
WHERE revision = '{{ revision }}' -- required
AND step = '{{ step }}'
AND timeline = '{{ timeline }}'
;
```
</TabItem>
</Tabs>
