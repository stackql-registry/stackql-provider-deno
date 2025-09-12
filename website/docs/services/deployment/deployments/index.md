--- 
title: deployments
hide_title: false
hide_table_of_contents: false
keywords:
  - deployments
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

Creates, updates, deletes, gets or lists a <code>deployments</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><code>deployments</code></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="deno.deployment.deployments" /></td></tr>
</tbody></table>

## Fields

The following fields are returned by `SELECT` queries:

<Tabs
    defaultValue="list_deployments"
    values={[
        { label: 'list_deployments', value: 'list_deployments' },
        { label: 'get_deployment', value: 'get_deployment' }
    ]}
>
<TabItem value="list_deployments">

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
    <td><code>string</code></td>
    <td>A deployment ID  Note that this is not UUID v4, as opposed to organization ID and project ID. (example: abcde12vwxyz)</td>
</tr>
<tr>
    <td><CopyableCode code="createdAt" /></td>
    <td><code>string (date-time)</code></td>
    <td> (example: 2021-08-01T00:00:00Z)</td>
</tr>
<tr>
    <td><CopyableCode code="databases" /></td>
    <td><code>object</code></td>
    <td>The KV databases that this deployment has access to. Currently, only `"default"` database is supported.</td>
</tr>
<tr>
    <td><CopyableCode code="description" /></td>
    <td><code>string</code></td>
    <td>The description of this deployment. This is present only when the `status` is `success`. (example: My deployment)</td>
</tr>
<tr>
    <td><CopyableCode code="domains" /></td>
    <td><code>array</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="permissions" /></td>
    <td><code>object</code></td>
    <td>Permissions to be set for the deployment.  Currently only `net` is supported, where you can specify a list of IP addresses and/or hostnames that the deployment is allowed to make outbound network requests to.</td>
</tr>
<tr>
    <td><CopyableCode code="projectId" /></td>
    <td><code>string (uuid)</code></td>
    <td> (example: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11)</td>
</tr>
<tr>
    <td><CopyableCode code="requestTimeout" /></td>
    <td><code>integer (int32)</code></td>
    <td>The wall-clock timeout in milliseconds for requests to the deployment.  This becomes `null` when no timeout is set, or the deployment has not been done successfully yet.</td>
</tr>
<tr>
    <td><CopyableCode code="status" /></td>
    <td><code>string</code></td>
    <td>The status of a deployment. (example: success)</td>
</tr>
<tr>
    <td><CopyableCode code="updatedAt" /></td>
    <td><code>string (date-time)</code></td>
    <td> (example: 2021-08-01T00:00:00Z)</td>
</tr>
</tbody>
</table>
</TabItem>
<TabItem value="get_deployment">

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
    <td><code>string</code></td>
    <td>A deployment ID  Note that this is not UUID v4, as opposed to organization ID and project ID. (example: abcde12vwxyz)</td>
</tr>
<tr>
    <td><CopyableCode code="createdAt" /></td>
    <td><code>string (date-time)</code></td>
    <td> (example: 2021-08-01T00:00:00Z)</td>
</tr>
<tr>
    <td><CopyableCode code="databases" /></td>
    <td><code>object</code></td>
    <td>The KV databases that this deployment has access to. Currently, only `"default"` database is supported.</td>
</tr>
<tr>
    <td><CopyableCode code="description" /></td>
    <td><code>string</code></td>
    <td>The description of this deployment. This is present only when the `status` is `success`. (example: My deployment)</td>
</tr>
<tr>
    <td><CopyableCode code="domains" /></td>
    <td><code>array</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="permissions" /></td>
    <td><code>object</code></td>
    <td>Permissions to be set for the deployment.  Currently only `net` is supported, where you can specify a list of IP addresses and/or hostnames that the deployment is allowed to make outbound network requests to.</td>
</tr>
<tr>
    <td><CopyableCode code="projectId" /></td>
    <td><code>string (uuid)</code></td>
    <td> (example: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11)</td>
</tr>
<tr>
    <td><CopyableCode code="requestTimeout" /></td>
    <td><code>integer (int32)</code></td>
    <td>The wall-clock timeout in milliseconds for requests to the deployment.  This becomes `null` when no timeout is set, or the deployment has not been done successfully yet.</td>
</tr>
<tr>
    <td><CopyableCode code="status" /></td>
    <td><code>string</code></td>
    <td>The status of a deployment. (example: success)</td>
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
    <td><a href="#list_deployments"><CopyableCode code="list_deployments" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-projectId"><code>projectId</code></a></td>
    <td><a href="#parameter-page"><code>page</code></a>, <a href="#parameter-limit"><code>limit</code></a>, <a href="#parameter-q"><code>q</code></a>, <a href="#parameter-sort"><code>sort</code></a>, <a href="#parameter-order"><code>order</code></a></td>
    <td>This API returns a list of deployments belonging to the specified project in<br />a pagenated manner.<br /><br />The URLs for the next, previous, first, and last page are returned in the<br />`Link` header of the response, if any.</td>
</tr>
<tr>
    <td><a href="#get_deployment"><CopyableCode code="get_deployment" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-deploymentId"><code>deploymentId</code></a></td>
    <td></td>
    <td></td>
</tr>
<tr>
    <td><a href="#create_deployment"><CopyableCode code="create_deployment" /></a></td>
    <td><CopyableCode code="insert" /></td>
    <td><a href="#parameter-projectId"><code>projectId</code></a>, <a href="#parameter-data__entryPointUrl"><code>data__entryPointUrl</code></a>, <a href="#parameter-data__assets"><code>data__assets</code></a>, <a href="#parameter-data__envVars"><code>data__envVars</code></a></td>
    <td></td>
    <td>This API initiates a build process for a new deployment.<br /><br />Note that this process is asynchronous; the completion of this API doesn't<br />mean the deployment is ready. In order to keep track of the progress of the<br />build, call the "Get build logs of a deployment" API or the "Get deployment<br />details" API.</td>
</tr>
<tr>
    <td><a href="#delete_deployment"><CopyableCode code="delete_deployment" /></a></td>
    <td><CopyableCode code="delete" /></td>
    <td><a href="#parameter-deploymentId"><code>deploymentId</code></a></td>
    <td></td>
    <td></td>
</tr>
<tr>
    <td><a href="#redeploy_deployment"><CopyableCode code="redeploy_deployment" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-deploymentId"><code>deploymentId</code></a></td>
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
<tr id="parameter-deploymentId">
    <td><CopyableCode code="deploymentId" /></td>
    <td><code>string</code></td>
    <td>Deployment ID</td>
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
    <td>Query by deployment ID</td>
</tr>
<tr id="parameter-sort">
    <td><CopyableCode code="sort" /></td>
    <td><code>string</code></td>
    <td>The field to sort by, either `id` or `created_at`. Defaults to `created_at`.</td>
</tr>
</tbody>
</table>

## `SELECT` examples

<Tabs
    defaultValue="list_deployments"
    values={[
        { label: 'list_deployments', value: 'list_deployments' },
        { label: 'get_deployment', value: 'get_deployment' }
    ]}
>
<TabItem value="list_deployments">

This API returns a list of deployments belonging to the specified project in<br />a pagenated manner.<br /><br />The URLs for the next, previous, first, and last page are returned in the<br />`Link` header of the response, if any.

```sql
SELECT
id,
createdAt,
databases,
description,
domains,
permissions,
projectId,
requestTimeout,
status,
updatedAt
FROM deno.deployment.deployments
WHERE projectId = '{{ projectId }}' -- required
AND page = '{{ page }}'
AND limit = '{{ limit }}'
AND q = '{{ q }}'
AND sort = '{{ sort }}'
AND order = '{{ order }}'
;
```
</TabItem>
<TabItem value="get_deployment">

Success

```sql
SELECT
id,
createdAt,
databases,
description,
domains,
permissions,
projectId,
requestTimeout,
status,
updatedAt
FROM deno.deployment.deployments
WHERE deploymentId = '{{ deploymentId }}' -- required
;
```
</TabItem>
</Tabs>


## `INSERT` examples

<Tabs
    defaultValue="create_deployment"
    values={[
        { label: 'create_deployment', value: 'create_deployment' },
        { label: 'Manifest', value: 'manifest' }
    ]}
>
<TabItem value="create_deployment">

This API initiates a build process for a new deployment.<br /><br />Note that this process is asynchronous; the completion of this API doesn't<br />mean the deployment is ready. In order to keep track of the progress of the<br />build, call the "Get build logs of a deployment" API or the "Get deployment<br />details" API.

```sql
INSERT INTO deno.deployment.deployments (
data__entryPointUrl,
data__importMapUrl,
data__lockFileUrl,
data__compilerOptions,
data__assets,
data__domains,
data__envVars,
data__databases,
data__requestTimeout,
data__permissions,
data__description,
data__enableCron,
projectId
)
SELECT 
'{{ entryPointUrl }}' /* required */,
'{{ importMapUrl }}',
'{{ lockFileUrl }}',
'{{ compilerOptions }}',
'{{ assets }}' /* required */,
'{{ domains }}',
'{{ envVars }}' /* required */,
'{{ databases }}',
{{ requestTimeout }},
'{{ permissions }}',
'{{ description }}',
{{ enableCron }},
'{{ projectId }}'
RETURNING
id,
createdAt,
databases,
description,
domains,
permissions,
projectId,
requestTimeout,
status,
updatedAt
;
```
</TabItem>
<TabItem value="manifest">

```yaml
# Description fields are for documentation purposes
- name: deployments
  props:
    - name: projectId
      value: string (uuid)
      description: Required parameter for the deployments resource.
    - name: entryPointUrl
      value: string
      description: |
        An URL of the entry point of the application.
        This is the file that will be executed when the deployment is invoked.
    - name: importMapUrl
      value: string
      description: |
        An URL of the import map file.
        If `null` is given, import map auto-discovery logic will be performed,
        where it looks for Deno's config file (i.e. `deno.json` or `deno.jsonc`)
        which may contain an embedded import map or a path to an import map file.
        If found, that import map will be used.
        If an empty string is given, no import map will be used.
    - name: lockFileUrl
      value: string
      description: |
        An URL of the lock file.
        If `null` is given, lock file auto-discovery logic will be performed,
        where it looks for Deno's config file (i.e. `deno.json` or `deno.jsonc`)
        which may contain a path to a lock file or boolean value, such as `"lock":
        false` or `"lock": "my-lock.lock"`. If a config file is found, the
        semantics of the lock field is the same as the Deno CLI, so refer to [the
        CLI doc page](https://docs.deno.com/runtime/manual/basics/modules/integrity_checking#auto-generated-lockfile).
        If an empty string is given, no lock file will be used.
    - name: compilerOptions
      value: object
      description: |
        Compiler options to be used when building the deployment.
        If `null` is given, Deno's config file (i.e. `deno.json` or `deno.jsonc`)
        will be auto-discovered, which may contain a `compilerOptions` field. If
        found, that compiler options will be applied.
        If an empty object `{}` is given, [the default compiler options](https://docs.deno.com/runtime/manual/advanced/typescript/configuration#how-deno-uses-a-configuration-file)
        will be applied.
    - name: assets
      value: object
      description: |
        A map whose key represents a file path, and the value is an asset that
        composes the deployment.
        Each asset is one of the following three kinds:
        1. A file with content data (which is UTF-8 for text, or base64 for binary)
        2. A file with a git sha1 hash of the content
        3. A symbolic link to another asset
        Assets that were uploaded in some of the previous deployments don't need to
        be uploaded again. In this case, in order to identify the asset, just provide the
        git SHA-1 hash of the content (use `git hash-object -t 'blob' <file>` command to generate).
    - name: domains
      value: array
      description: |
        A list of domains that will be attached to the deployment once it's
        successfully deployed.
        If this field is omitted or `null` is provided, the default domain will be
        attached to the deployment, which looks like `projectname-deploymentid.deno.dev`.
        If an empty list is provided, no domain will be attached to the deployment.
        In this case, the default one will not get attached either.
        If a list is provided, only the domains in the list will be attached, but
        the default domain will not.
    - name: envVars
      value: object
      description: |
        A dictionary of environment variables to be set in the runtime environment
        of the deployment.
    - name: databases
      value: object
      description: |
        KV database ID mappings to associate with the deployment.
        A key represents a KV database name (e.g. `"default"`), and a value is a
        KV database ID.
        Currently, only `"default"` database is supported. If any other database
        name is specified, that will be rejected.
        If not provided, the deployment will be created with no KV database
        attached.
    - name: requestTimeout
      value: integer
      description: |
        The wall-clock timeout in milliseconds for requests to the deployment.
        If not provided, the system default value will be used.
    - name: permissions
      value: object
      description: |
        Permissions to be set for the deployment.
        Currently only `net` is supported, where you can specify a list of IP
        addresses and/or hostnames that the deployment is allowed to make outbound
        network requests to.
    - name: description
      value: string
      description: |
        A description of the created deployment. If not provided, an empty string
        will be set.
    - name: enableCron
      value: boolean
      description: |
        Enables cron functionality for this deployment. Requires a database to be attached.
        When multiple projects share the same database, only the first project to enable crons
        will have access to cron management. Other projects sharing the database cannot use crons.
```
</TabItem>
</Tabs>


## `DELETE` examples

<Tabs
    defaultValue="delete_deployment"
    values={[
        { label: 'delete_deployment', value: 'delete_deployment' }
    ]}
>
<TabItem value="delete_deployment">

No description available.

```sql
DELETE FROM deno.deployment.deployments
WHERE deploymentId = '{{ deploymentId }}' --required
;
```
</TabItem>
</Tabs>


## Lifecycle Methods

<Tabs
    defaultValue="redeploy_deployment"
    values={[
        { label: 'redeploy_deployment', value: 'redeploy_deployment' }
    ]}
>
<TabItem value="redeploy_deployment">

Success

```sql
EXEC deno.deployment.deployments.redeploy_deployment 
@deploymentId='{{ deploymentId }}' --required 
@@json=
'{
"envVars": "{{ envVars }}", 
"databases": "{{ databases }}", 
"requestTimeout": {{ requestTimeout }}, 
"permissions": "{{ permissions }}", 
"description": "{{ description }}"
}'
;
```
</TabItem>
</Tabs>
