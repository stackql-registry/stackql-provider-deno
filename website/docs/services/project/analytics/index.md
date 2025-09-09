--- 
title: analytics
hide_title: false
hide_table_of_contents: false
keywords:
  - analytics
  - project
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

Creates, updates, deletes, gets or lists an <code>analytics</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><code>analytics</code></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="deno.project.analytics" /></td></tr>
</tbody></table>

## Fields

The following fields are returned by `SELECT` queries:

<Tabs
    defaultValue="get_project_analytics"
    values={[
        { label: 'get_project_analytics', value: 'get_project_analytics' }
    ]}
>
<TabItem value="get_project_analytics">

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
    <td><CopyableCode code="fields" /></td>
    <td><code>array</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="values" /></td>
    <td><code>array</code></td>
    <td></td>
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
    <td><a href="#get_project_analytics"><CopyableCode code="get_project_analytics" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-projectId"><code>projectId</code></a>, <a href="#parameter-since"><code>since</code></a>, <a href="#parameter-until"><code>until</code></a></td>
    <td></td>
    <td>This API returns analytics for the specified project.<br />The analytics are returned as time series data in 15 minute intervals, with<br />the `time` field representing the start of the interval.</td>
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
<tr id="parameter-projectId">
    <td><CopyableCode code="projectId" /></td>
    <td><code>string (uuid)</code></td>
    <td>Project ID</td>
</tr>
<tr id="parameter-since">
    <td><CopyableCode code="since" /></td>
    <td><code>string (date-time)</code></td>
    <td> Start of the time range in RFC3339 format.  Defaults to 24 hours ago.        (example: 2021-08-01T00:00:00Z)</td>
</tr>
<tr id="parameter-until">
    <td><CopyableCode code="until" /></td>
    <td><code>string (date-time)</code></td>
    <td> End of the time range in RFC3339 format.  Defaults to the current time.        (example: 2021-08-02T00:00:00Z)</td>
</tr>
</tbody>
</table>

## `SELECT` examples

<Tabs
    defaultValue="get_project_analytics"
    values={[
        { label: 'get_project_analytics', value: 'get_project_analytics' }
    ]}
>
<TabItem value="get_project_analytics">

This API returns analytics for the specified project.<br />The analytics are returned as time series data in 15 minute intervals, with<br />the `time` field representing the start of the interval.

```sql
SELECT
fields,
values
FROM deno.project.analytics
WHERE projectId = '{{ projectId }}' -- required
AND since = '{{ since }}' -- required
AND until = '{{ until }}' -- required;
```
</TabItem>
</Tabs>
