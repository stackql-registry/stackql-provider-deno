--- 
title: projects
hide_title: false
hide_table_of_contents: false
keywords:
  - projects
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

Creates, updates, deletes, gets or lists a <code>projects</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><code>projects</code></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="deno.project.projects" /></td></tr>
</tbody></table>

## Fields

The following fields are returned by `SELECT` queries:

<Tabs
    defaultValue="list_projects"
    values={[
        { label: 'list_projects', value: 'list_projects' },
        { label: 'get_project', value: 'get_project' }
    ]}
>
<TabItem value="list_projects">

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
    <td> (example: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11)</td>
</tr>
<tr>
    <td><CopyableCode code="name" /></td>
    <td><code>string</code></td>
    <td> (example: my-project)</td>
</tr>
<tr>
    <td><CopyableCode code="createdAt" /></td>
    <td><code>string (date-time)</code></td>
    <td> (example: 2021-08-01T00:00:00Z)</td>
</tr>
<tr>
    <td><CopyableCode code="description" /></td>
    <td><code>string</code></td>
    <td> (example: this is my project.)</td>
</tr>
<tr>
    <td><CopyableCode code="updatedAt" /></td>
    <td><code>string (date-time)</code></td>
    <td> (example: 2021-08-01T00:00:00Z)</td>
</tr>
</tbody>
</table>
</TabItem>
<TabItem value="get_project">

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
    <td> (example: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11)</td>
</tr>
<tr>
    <td><CopyableCode code="name" /></td>
    <td><code>string</code></td>
    <td> (example: my-project)</td>
</tr>
<tr>
    <td><CopyableCode code="createdAt" /></td>
    <td><code>string (date-time)</code></td>
    <td> (example: 2021-08-01T00:00:00Z)</td>
</tr>
<tr>
    <td><CopyableCode code="description" /></td>
    <td><code>string</code></td>
    <td> (example: this is my project.)</td>
</tr>
<tr>
    <td><CopyableCode code="updatedAt" /></td>
    <td><code>string (date-time)</code></td>
    <td> (example: 2021-08-01T00:00:00Z)</td>
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
    <td><a href="#list_projects"><CopyableCode code="list_projects" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-organizationId"><code>organizationId</code></a></td>
    <td><a href="#parameter-page"><code>page</code></a>, <a href="#parameter-limit"><code>limit</code></a>, <a href="#parameter-q"><code>q</code></a>, <a href="#parameter-sort"><code>sort</code></a>, <a href="#parameter-order"><code>order</code></a></td>
    <td>This API returns a list of projects belonging to the specified organization<br />in a pagenated manner.<br />The URLs for the next, previous, first, and last page are returned in the<br />`Link` header of the response, if any.</td>
</tr>
<tr>
    <td><a href="#get_project"><CopyableCode code="get_project" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-projectId"><code>projectId</code></a></td>
    <td></td>
    <td></td>
</tr>
<tr>
    <td><a href="#create_project"><CopyableCode code="create_project" /></a></td>
    <td><CopyableCode code="insert" /></td>
    <td><a href="#parameter-organizationId"><code>organizationId</code></a></td>
    <td></td>
    <td>This API allows you to create a new project under the specified<br />organization.<br />The project name is optional; if not provided, a random name will be<br />generated.</td>
</tr>
<tr>
    <td><a href="#update_project"><CopyableCode code="update_project" /></a></td>
    <td><CopyableCode code="update" /></td>
    <td><a href="#parameter-projectId"><code>projectId</code></a></td>
    <td></td>
    <td></td>
</tr>
<tr>
    <td><a href="#delete_project"><CopyableCode code="delete_project" /></a></td>
    <td><CopyableCode code="delete" /></td>
    <td><a href="#parameter-projectId"><code>projectId</code></a></td>
    <td></td>
    <td></td>
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
<tr id="parameter-projectId">
    <td><CopyableCode code="projectId" /></td>
    <td><code>string (uuid)</code></td>
    <td>Project ID</td>
</tr>
<tr id="parameter-limit">
    <td><CopyableCode code="limit" /></td>
    <td><code>integer</code></td>
    <td>The maximum number of items to return per page.</td>
</tr>
<tr id="parameter-order">
    <td><CopyableCode code="order" /></td>
    <td><code>string</code></td>
    <td>Sort order, either `asc` or `desc`. Defaults to `asc`.</td>
</tr>
<tr id="parameter-page">
    <td><CopyableCode code="page" /></td>
    <td><code>integer</code></td>
    <td>The page number to return.</td>
</tr>
<tr id="parameter-q">
    <td><CopyableCode code="q" /></td>
    <td><code>string</code></td>
    <td>Query by project name or project ID</td>
</tr>
<tr id="parameter-sort">
    <td><CopyableCode code="sort" /></td>
    <td><code>string</code></td>
    <td>The field to sort by, either `name`, `updated_at`, `requests`, or `bandwidth`. Defaults to `updated_at`.</td>
</tr>
</tbody>
</table>

## `SELECT` examples

<Tabs
    defaultValue="list_projects"
    values={[
        { label: 'list_projects', value: 'list_projects' },
        { label: 'get_project', value: 'get_project' }
    ]}
>
<TabItem value="list_projects">

This API returns a list of projects belonging to the specified organization<br />in a pagenated manner.<br />The URLs for the next, previous, first, and last page are returned in the<br />`Link` header of the response, if any.

```sql
SELECT
id,
name,
createdAt,
description,
updatedAt
FROM deno.project.projects
WHERE organizationId = '{{ organizationId }}' -- required
AND page = '{{ page }}'
AND limit = '{{ limit }}'
AND q = '{{ q }}'
AND sort = '{{ sort }}'
AND order = '{{ order }}';
```
</TabItem>
<TabItem value="get_project">

Success

```sql
SELECT
id,
name,
createdAt,
description,
updatedAt
FROM deno.project.projects
WHERE projectId = '{{ projectId }}' -- required;
```
</TabItem>
</Tabs>


## `INSERT` examples

<Tabs
    defaultValue="create_project"
    values={[
        { label: 'create_project', value: 'create_project' },
        { label: 'Manifest', value: 'manifest' }
    ]}
>
<TabItem value="create_project">

This API allows you to create a new project under the specified<br />organization.<br />The project name is optional; if not provided, a random name will be<br />generated.

```sql
INSERT INTO deno.project.projects (
data__name,
data__description,
organizationId
)
SELECT 
'{{ name }}',
'{{ description }}',
'{{ organizationId }}'
RETURNING
id,
name,
createdAt,
description,
updatedAt
;
```
</TabItem>
<TabItem value="manifest">

```yaml
# Description fields are for documentation purposes
- name: projects
  props:
    - name: organizationId
      value: string (uuid)
      description: Required parameter for the projects resource.
    - name: name
      value: string
      description: >
        The name of the project. This must be globally unique. If this is `null`,
a random unique name will be generated.
        
    - name: description
      value: string
      description: >
        The description of the project. If this is `null`, an empty string will be
set.
        
```
</TabItem>
</Tabs>


## `UPDATE` examples

<Tabs
    defaultValue="update_project"
    values={[
        { label: 'update_project', value: 'update_project' }
    ]}
>
<TabItem value="update_project">

No description available.

```sql
UPDATE deno.project.projects
SET 
data__name = '{{ name }}',
data__description = '{{ description }}'
WHERE 
projectId = '{{ projectId }}' --required
RETURNING
id,
name,
createdAt,
description,
updatedAt;
```
</TabItem>
</Tabs>


## `DELETE` examples

<Tabs
    defaultValue="delete_project"
    values={[
        { label: 'delete_project', value: 'delete_project' }
    ]}
>
<TabItem value="delete_project">

No description available.

```sql
DELETE FROM deno.project.projects
WHERE projectId = '{{ projectId }}' --required;
```
</TabItem>
</Tabs>
