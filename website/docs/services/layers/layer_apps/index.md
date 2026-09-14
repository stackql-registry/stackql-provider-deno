--- 
title: layer_apps
hide_title: false
hide_table_of_contents: false
keywords:
  - layer_apps
  - layers
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

Creates, updates, deletes, gets or lists a <code>layer_apps</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="layer_apps" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="deno.layers.layer_apps" /></td></tr>
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
    <td><CopyableCode code="id" /></td>
    <td><code>string (uuid)</code></td>
    <td>Unique app identifier (UUID)</td>
</tr>
<tr>
    <td><CopyableCode code="layer_position" /></td>
    <td><code>integer</code></td>
    <td>Index of this layer in the app's `layers` array</td>
</tr>
<tr>
    <td><CopyableCode code="slug" /></td>
    <td><code>string</code></td>
    <td>Human-readable app slug. App slugs must be 3–32 characters long, may contain only lowercase letters, numbers, and hyphens, cannot contain underscores, must not start or end with a hyphen, must not have consecutive hyphens in positions 3 and 4, and cannot be a reserved slug.</td>
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
    <td><a href="#parameter-layer"><code>layer</code></a></td>
    <td><a href="#parameter-cursor"><code>cursor</code></a>, <a href="#parameter-limit"><code>limit</code></a></td>
    <td>List apps that reference this layer.&lt;br /&gt;&lt;br /&gt;The `layer_position` indicates the index in each app's `layers` array.</td>
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
<tr id="parameter-layer">
    <td><CopyableCode code="layer" /></td>
    <td><code>string</code></td>
    <td>Layer ID or slug. Slugs cannot contain underscores; IDs always do.</td>
</tr>
<tr id="parameter-cursor">
    <td><CopyableCode code="cursor" /></td>
    <td><code>string</code></td>
    <td>The pagination cursor</td>
</tr>
<tr id="parameter-limit">
    <td><CopyableCode code="limit" /></td>
    <td><code>integer</code></td>
    <td>The maximum number of items to return</td>
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

List apps that reference this layer.&lt;br /&gt;&lt;br /&gt;The `layer_position` indicates the index in each app's `layers` array.

```sql
SELECT
id,
layer_position,
slug
FROM deno.layers.layer_apps
WHERE layer = '{{ layer }}' -- required
AND cursor = '{{ cursor }}'
AND limit = '{{ limit }}'
;
```
</TabItem>
</Tabs>
