--- 
title: build_progress
hide_title: false
hide_table_of_contents: false
keywords:
  - build_progress
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

Creates, updates, deletes, gets or lists a <code>build_progress</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="build_progress" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="deno.revisions.build_progress" /></td></tr>
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
    <td><CopyableCode code="building" /></td>
    <td><code>object</code></td>
    <td>Build stage — running the build command</td>
</tr>
<tr>
    <td><CopyableCode code="deploying" /></td>
    <td><code>object</code></td>
    <td>Deploy stage — uploading artifacts and routing traffic</td>
</tr>
<tr>
    <td><CopyableCode code="installing" /></td>
    <td><code>object</code></td>
    <td>Install stage — installing dependencies</td>
</tr>
<tr>
    <td><CopyableCode code="preparing" /></td>
    <td><code>object</code></td>
    <td>Prepare stage — cloning source code and restoring caches</td>
</tr>
<tr>
    <td><CopyableCode code="queued" /></td>
    <td><code>object</code></td>
    <td>Queue stage — waiting for a build slot</td>
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
    <td></td>
    <td>Stream revision build progress. The stream ends when the revision&lt;br /&gt;reaches a terminal state (`succeeded`, `failed`, or `skipped`).&lt;br /&gt;&lt;br /&gt;Supports both JSONL (`Accept: application/x-ndjson`) and SSE (`Accept: text/event-stream`)&lt;br /&gt;formats via the `Accept` header.</td>
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

Stream revision build progress. The stream ends when the revision&lt;br /&gt;reaches a terminal state (`succeeded`, `failed`, or `skipped`).&lt;br /&gt;&lt;br /&gt;Supports both JSONL (`Accept: application/x-ndjson`) and SSE (`Accept: text/event-stream`)&lt;br /&gt;formats via the `Accept` header.

```sql
SELECT
building,
deploying,
installing,
preparing,
queued
FROM deno.revisions.build_progress
WHERE revision = '{{ revision }}' -- required
;
```
</TabItem>
</Tabs>
