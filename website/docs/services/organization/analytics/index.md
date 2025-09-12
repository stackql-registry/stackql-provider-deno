--- 
title: analytics
hide_title: false
hide_table_of_contents: false
keywords:
  - analytics
  - organization
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
<tr><td><b>Id</b></td><td><CopyableCode code="deno.organization.analytics" /></td></tr>
</tbody></table>

## Fields

The following fields are returned by `SELECT` queries:

<Tabs
    defaultValue="get_organization_analytics"
    values={[
        { label: 'get_organization_analytics', value: 'get_organization_analytics' }
    ]}
>
<TabItem value="get_organization_analytics">

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
    <td><a href="#get_organization_analytics"><CopyableCode code="get_organization_analytics" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-organizationId"><code>organizationId</code></a>, <a href="#parameter-since"><code>since</code></a>, <a href="#parameter-until"><code>until</code></a></td>
    <td></td>
    <td>This API returns analytics for the specified organization.<br />The analytics are returned as time series data in 15 minute intervals, with<br />the `time` field representing the start of the interval.</td>
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
<tr id="parameter-organizationId">
    <td><CopyableCode code="organizationId" /></td>
    <td><code>string (uuid)</code></td>
    <td>Organization ID</td>
</tr>
<tr id="parameter-since">
    <td><CopyableCode code="since" /></td>
    <td><code>string (date-time)</code></td>
    <td> Start of the time range in RFC3339 format.  Defaults to 24 hours ago.  Note that the maximum allowed time range is 24 hours.        (example: 2021-08-01T00:00:00Z)</td>
</tr>
<tr id="parameter-until">
    <td><CopyableCode code="until" /></td>
    <td><code>string (date-time)</code></td>
    <td> End of the time range in RFC3339 format.  Defaults to the current time.  Note that the maximum allowed time range is 24 hours.        (example: 2021-08-02T00:00:00Z)</td>
</tr>
</tbody>
</table>

## `SELECT` examples

<Tabs
    defaultValue="get_organization_analytics"
    values={[
        { label: 'get_organization_analytics', value: 'get_organization_analytics' }
    ]}
>
<TabItem value="get_organization_analytics">

This API returns analytics for the specified organization.<br />The analytics are returned as time series data in 15 minute intervals, with<br />the `time` field representing the start of the interval.

```sql
SELECT
fields,
values
FROM deno.organization.analytics
WHERE organizationId = '{{ organizationId }}' -- required
AND since = '{{ since }}' -- required
AND until = '{{ until }}' -- required
;
```
</TabItem>
</Tabs>
