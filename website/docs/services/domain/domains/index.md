--- 
title: domains
hide_title: false
hide_table_of_contents: false
keywords:
  - domains
  - domain
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
<tr><td><b>Id</b></td><td><CopyableCode code="deno.domain.domains" /></td></tr>
</tbody></table>

## Fields

The following fields are returned by `SELECT` queries:

<Tabs
    defaultValue="list_domains"
    values={[
        { label: 'list_domains', value: 'list_domains' },
        { label: 'get_domain', value: 'get_domain' }
    ]}
>
<TabItem value="list_domains">

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
    <td>The ID of the domain.</td>
</tr>
<tr>
    <td><CopyableCode code="certificates" /></td>
    <td><code>array</code></td>
    <td>TLS certificates for the domain.</td>
</tr>
<tr>
    <td><CopyableCode code="createdAt" /></td>
    <td><code>string (date-time)</code></td>
    <td> (example: 2021-08-01T00:00:00Z)</td>
</tr>
<tr>
    <td><CopyableCode code="deploymentId" /></td>
    <td><code>string</code></td>
    <td>A deployment ID  Note that this is not UUID v4, as opposed to organization ID and project ID. (example: abcde12vwxyz)</td>
</tr>
<tr>
    <td><CopyableCode code="dnsRecords" /></td>
    <td><code>array</code></td>
    <td>These records are used to verify the ownership of the domain.</td>
</tr>
<tr>
    <td><CopyableCode code="domain" /></td>
    <td><code>string</code></td>
    <td>The domain value. (example: example.com)</td>
</tr>
<tr>
    <td><CopyableCode code="isValidated" /></td>
    <td><code>boolean</code></td>
    <td>Whether the domain's ownership is validated or not.</td>
</tr>
<tr>
    <td><CopyableCode code="organizationId" /></td>
    <td><code>string (uuid)</code></td>
    <td>The ID of the organization that the domain is associated with.</td>
</tr>
<tr>
    <td><CopyableCode code="projectId" /></td>
    <td><code>string (uuid)</code></td>
    <td>The ID of the project that the domain is associated with.  If the domain is not associated with any project, this field is omitted.</td>
</tr>
<tr>
    <td><CopyableCode code="provisioningStatus" /></td>
    <td><code></code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="token" /></td>
    <td><code>string</code></td>
    <td> (example: b7e28147130005f5593d09e6)</td>
</tr>
<tr>
    <td><CopyableCode code="updatedAt" /></td>
    <td><code>string (date-time)</code></td>
    <td> (example: 2021-08-01T00:00:00Z)</td>
</tr>
</tbody>
</table>
</TabItem>
<TabItem value="get_domain">

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
    <td>The ID of the domain.</td>
</tr>
<tr>
    <td><CopyableCode code="certificates" /></td>
    <td><code>array</code></td>
    <td>TLS certificates for the domain.</td>
</tr>
<tr>
    <td><CopyableCode code="createdAt" /></td>
    <td><code>string (date-time)</code></td>
    <td> (example: 2021-08-01T00:00:00Z)</td>
</tr>
<tr>
    <td><CopyableCode code="deploymentId" /></td>
    <td><code>string</code></td>
    <td>A deployment ID  Note that this is not UUID v4, as opposed to organization ID and project ID. (example: abcde12vwxyz)</td>
</tr>
<tr>
    <td><CopyableCode code="dnsRecords" /></td>
    <td><code>array</code></td>
    <td>These records are used to verify the ownership of the domain.</td>
</tr>
<tr>
    <td><CopyableCode code="domain" /></td>
    <td><code>string</code></td>
    <td>The domain value. (example: example.com)</td>
</tr>
<tr>
    <td><CopyableCode code="isValidated" /></td>
    <td><code>boolean</code></td>
    <td>Whether the domain's ownership is validated or not.</td>
</tr>
<tr>
    <td><CopyableCode code="organizationId" /></td>
    <td><code>string (uuid)</code></td>
    <td>The ID of the organization that the domain is associated with.</td>
</tr>
<tr>
    <td><CopyableCode code="projectId" /></td>
    <td><code>string (uuid)</code></td>
    <td>The ID of the project that the domain is associated with.  If the domain is not associated with any project, this field is omitted.</td>
</tr>
<tr>
    <td><CopyableCode code="provisioningStatus" /></td>
    <td><code></code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="token" /></td>
    <td><code>string</code></td>
    <td> (example: b7e28147130005f5593d09e6)</td>
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
    <td><a href="#list_domains"><CopyableCode code="list_domains" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-organizationId"><code>organizationId</code></a></td>
    <td><a href="#parameter-page"><code>page</code></a>, <a href="#parameter-limit"><code>limit</code></a>, <a href="#parameter-q"><code>q</code></a>, <a href="#parameter-sort"><code>sort</code></a>, <a href="#parameter-order"><code>order</code></a></td>
    <td>This API returns a list of domains belonging to the specified organization<br />in a pagenated manner.<br /><br />The URLs for the next, previous, first, and last page are returned in the<br />`Link` header of the response, if any.</td>
</tr>
<tr>
    <td><a href="#get_domain"><CopyableCode code="get_domain" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-domainId"><code>domainId</code></a></td>
    <td></td>
    <td></td>
</tr>
<tr>
    <td><a href="#create_domain"><CopyableCode code="create_domain" /></a></td>
    <td><CopyableCode code="insert" /></td>
    <td><a href="#parameter-organizationId"><code>organizationId</code></a>, <a href="#parameter-data__domain"><code>data__domain</code></a></td>
    <td></td>
    <td>This API allows you to add a new domain to the specified organization.<br /><br />### Steps to make the added domain available for actual use<br /><br />In order to make the added domain available for actual use, you first need<br />to verify that you are the owner of the domain by calling<br />[the verify ownership of a domain endpoint](https://deno-provider.stackql.io/services/domain/domains/#lifecycle-methods)<br />after properly setting up the DNS records for the domain as specified in the<br />`dnsRecords` field of the response of this API.<br /><br />You then also need to have TLS certificates ready for the domain, either by<br />[enabling auto-provision](https://deno-provider.stackql.io/services/domain/certificates/#lifecycle-methods)<br />or by [uploading them manually](https://deno-provider.stackql.io/services/domain/certificates/).</td>
</tr>
<tr>
    <td><a href="#delete_domain"><CopyableCode code="delete_domain" /></a></td>
    <td><CopyableCode code="delete" /></td>
    <td><a href="#parameter-domainId"><code>domainId</code></a></td>
    <td></td>
    <td></td>
</tr>
<tr>
    <td><a href="#update_domain_association"><CopyableCode code="update_domain_association" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-domainId"><code>domainId</code></a></td>
    <td></td>
    <td>This API allows you to either:<br /><br />1. associate a domain with a deployment, or<br />2. disassociate a domain from a deployment<br /><br />Domain association is required in order to serve the deployment on the<br />domain.<br /><br />If the ownership of the domain is not verified yet, this API will trigger<br />the verification process before associating the domain with the deployment.<br /><br />The same functionality is provided by [Attach a domain to a deployment] with<br />more flexibility. Consider using that API instead.<br /><br />[Attach a domain to a deployment]: #put-/deployments/-deploymentId-/domains/-domain-</td>
</tr>
<tr>
    <td><a href="#verify_domain"><CopyableCode code="verify_domain" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-domainId"><code>domainId</code></a></td>
    <td></td>
    <td>This API triggers the ownership verification of a domain. It should be<br />called after necessary DNS records that appear in the `dnsRecords` field<br />of the response of [add a domain](https://deno-provider.stackql.io/services/domain/domains/)<br />are set up.<br /><br />### Domain reactivation<br /><br />If a previously vefified domain, owned by the same organization, was deleted<br />and then re-added, deployments associated with the domain will become<br />accessible via the domain once the verification is successfully completed.<br /><br />For example, if the domain `*.example.com` was owned and verified by<br />`example-org` and `foo.example.com` was attached to `example-deployment`,<br />the deployment was accessible via `foo.example.com`. However, if the domain<br />is deleted from the organization, access to the deployment via<br />`foo.example.com` is lost, which we refer to as domain deactivation.<br /><br />Subsequently, if `*.example.com` (or even `foo.example.com`) is re-added to<br />the organization and verified, the deployment becomes accessible via<br />`foo.example.com` again without any further steps, i.e. the domain is<br />reactivated.</td>
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
<tr id="parameter-domainId">
    <td><CopyableCode code="domainId" /></td>
    <td><code>string (uuid)</code></td>
    <td>Domain ID</td>
</tr>
<tr id="parameter-organizationId">
    <td><CopyableCode code="organizationId" /></td>
    <td><code>string (uuid)</code></td>
    <td>Organization ID</td>
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
    <td>Query by domain</td>
</tr>
<tr id="parameter-sort">
    <td><CopyableCode code="sort" /></td>
    <td><code>string</code></td>
    <td>The field to sort by, `domain`, `created_at`, or `updated_at`. Defaults to `updated_at`.</td>
</tr>
</tbody>
</table>

## `SELECT` examples

<Tabs
    defaultValue="list_domains"
    values={[
        { label: 'list_domains', value: 'list_domains' },
        { label: 'get_domain', value: 'get_domain' }
    ]}
>
<TabItem value="list_domains">

This API returns a list of domains belonging to the specified organization<br />in a pagenated manner.<br /><br />The URLs for the next, previous, first, and last page are returned in the<br />`Link` header of the response, if any.

```sql
SELECT
id,
certificates,
createdAt,
deploymentId,
dnsRecords,
domain,
isValidated,
organizationId,
projectId,
provisioningStatus,
token,
updatedAt
FROM deno.domain.domains
WHERE organizationId = '{{ organizationId }}' -- required
AND page = '{{ page }}'
AND limit = '{{ limit }}'
AND q = '{{ q }}'
AND sort = '{{ sort }}'
AND order = '{{ order }}';
```
</TabItem>
<TabItem value="get_domain">

Success

```sql
SELECT
id,
certificates,
createdAt,
deploymentId,
dnsRecords,
domain,
isValidated,
organizationId,
projectId,
provisioningStatus,
token,
updatedAt
FROM deno.domain.domains
WHERE domainId = '{{ domainId }}' -- required;
```
</TabItem>
</Tabs>


## `INSERT` examples

<Tabs
    defaultValue="create_domain"
    values={[
        { label: 'create_domain', value: 'create_domain' },
        { label: 'Manifest', value: 'manifest' }
    ]}
>
<TabItem value="create_domain">

This API allows you to add a new domain to the specified organization.<br /><br />### Steps to make the added domain available for actual use<br /><br />In order to make the added domain available for actual use, you first need<br />to verify that you are the owner of the domain by calling<br />[the verify ownership of a domain endpoint](https://deno-provider.stackql.io/services/domain/domains/#lifecycle-methods)<br />after properly setting up the DNS records for the domain as specified in the<br />`dnsRecords` field of the response of this API.<br /><br />You then also need to have TLS certificates ready for the domain, either by<br />[enabling auto-provision](https://deno-provider.stackql.io/services/domain/certificates/#lifecycle-methods)<br />or by [uploading them manually](https://deno-provider.stackql.io/services/domain/certificates/).

```sql
INSERT INTO deno.domain.domains (
data__domain,
organizationId
)
SELECT 
'{{ domain }}' --required,
'{{ organizationId }}'
RETURNING
id,
certificates,
createdAt,
deploymentId,
dnsRecords,
domain,
isValidated,
organizationId,
projectId,
provisioningStatus,
token,
updatedAt
;
```
</TabItem>
<TabItem value="manifest">

```yaml
# Description fields are for documentation purposes
- name: domains
  props:
    - name: organizationId
      value: string (uuid)
      description: Required parameter for the domains resource.
    - name: domain
      value: string
```
</TabItem>
</Tabs>


## `DELETE` examples

<Tabs
    defaultValue="delete_domain"
    values={[
        { label: 'delete_domain', value: 'delete_domain' }
    ]}
>
<TabItem value="delete_domain">

No description available.

```sql
DELETE FROM deno.domain.domains
WHERE domainId = '{{ domainId }}' --required;
```
</TabItem>
</Tabs>


## Lifecycle Methods

<Tabs
    defaultValue="update_domain_association"
    values={[
        { label: 'update_domain_association', value: 'update_domain_association' },
        { label: 'verify_domain', value: 'verify_domain' }
    ]}
>
<TabItem value="update_domain_association">

This API allows you to either:<br /><br />1. associate a domain with a deployment, or<br />2. disassociate a domain from a deployment<br /><br />Domain association is required in order to serve the deployment on the<br />domain.<br /><br />If the ownership of the domain is not verified yet, this API will trigger<br />the verification process before associating the domain with the deployment.<br /><br />The same functionality is provided by [Attach a domain to a deployment] with<br />more flexibility. Consider using that API instead.<br /><br />[Attach a domain to a deployment]: #put-/deployments/-deploymentId-/domains/-domain-

```sql
EXEC deno.domain.domains.update_domain_association 
@domainId='{{ domainId }}' --required 
@@json=
'{
"deploymentId": "{{ deploymentId }}"
}';
```
</TabItem>
<TabItem value="verify_domain">

This API triggers the ownership verification of a domain. It should be<br />called after necessary DNS records that appear in the `dnsRecords` field<br />of the response of [add a domain](https://deno-provider.stackql.io/services/domain/domains/)<br />are set up.<br /><br />### Domain reactivation<br /><br />If a previously vefified domain, owned by the same organization, was deleted<br />and then re-added, deployments associated with the domain will become<br />accessible via the domain once the verification is successfully completed.<br /><br />For example, if the domain `*.example.com` was owned and verified by<br />`example-org` and `foo.example.com` was attached to `example-deployment`,<br />the deployment was accessible via `foo.example.com`. However, if the domain<br />is deleted from the organization, access to the deployment via<br />`foo.example.com` is lost, which we refer to as domain deactivation.<br /><br />Subsequently, if `*.example.com` (or even `foo.example.com`) is re-added to<br />the organization and verified, the deployment becomes accessible via<br />`foo.example.com` again without any further steps, i.e. the domain is<br />reactivated.

```sql
EXEC deno.domain.domains.verify_domain 
@domainId='{{ domainId }}' --required;
```
</TabItem>
</Tabs>
