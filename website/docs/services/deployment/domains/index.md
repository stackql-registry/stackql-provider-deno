--- 
title: domains
hide_title: false
hide_table_of_contents: false
keywords:
  - domains
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

Creates, updates, deletes, gets or lists a <code>domains</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><code>domains</code></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="deno.deployment.domains" /></td></tr>
</tbody></table>

## Fields

The following fields are returned by `SELECT` queries:

`SELECT` not supported for this resource, use `SHOW METHODS` to view available operations for the resource.


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
    <td><a href="#attach_domain_to_deployment"><CopyableCode code="attach_domain_to_deployment" /></a></td>
    <td><CopyableCode code="replace" /></td>
    <td><a href="#parameter-deploymentId"><code>deploymentId</code></a>, <a href="#parameter-domain"><code>domain</code></a></td>
    <td></td>
    <td>This API allows you to attach a domain to an existing deployment. Once<br />attached, the deployment will become accessible via that domain.<br /><br />If the specified domain is already attached to another deployment, it will<br />be detached from the current deployment and attached to the new one.</td>
</tr>
<tr>
    <td><a href="#detach_domain_from_deployment"><CopyableCode code="detach_domain_from_deployment" /></a></td>
    <td><CopyableCode code="delete" /></td>
    <td><a href="#parameter-deploymentId"><code>deploymentId</code></a>, <a href="#parameter-domain"><code>domain</code></a></td>
    <td></td>
    <td>This API disassociates a domain from a deployment. Once this operation is<br />completed, the deployment will no longer be accessible via that domain.</td>
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
<tr id="parameter-domain">
    <td><CopyableCode code="domain" /></td>
    <td><code>string</code></td>
    <td>Domain to detach</td>
</tr>
</tbody>
</table>

## `REPLACE` examples

<Tabs
    defaultValue="attach_domain_to_deployment"
    values={[
        { label: 'attach_domain_to_deployment', value: 'attach_domain_to_deployment' }
    ]}
>
<TabItem value="attach_domain_to_deployment">

This API allows you to attach a domain to an existing deployment. Once<br />attached, the deployment will become accessible via that domain.<br /><br />If the specified domain is already attached to another deployment, it will<br />be detached from the current deployment and attached to the new one.

```sql
REPLACE deno.deployment.domains
SET 
-- No updatable properties
WHERE 
deploymentId = '{{ deploymentId }}' --required
AND domain = '{{ domain }}' --required
RETURNING
domain;
```
</TabItem>
</Tabs>


## `DELETE` examples

<Tabs
    defaultValue="detach_domain_from_deployment"
    values={[
        { label: 'detach_domain_from_deployment', value: 'detach_domain_from_deployment' }
    ]}
>
<TabItem value="detach_domain_from_deployment">

This API disassociates a domain from a deployment. Once this operation is<br />completed, the deployment will no longer be accessible via that domain.

```sql
DELETE FROM deno.deployment.domains
WHERE deploymentId = '{{ deploymentId }}' --required
AND domain = '{{ domain }}' --required;
```
</TabItem>
</Tabs>
