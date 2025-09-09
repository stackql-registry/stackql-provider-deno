--- 
title: certificates
hide_title: false
hide_table_of_contents: false
keywords:
  - certificates
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

Creates, updates, deletes, gets or lists a <code>certificates</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><code>certificates</code></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="deno.domain.certificates" /></td></tr>
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
    <td><a href="#add_domain_certificate"><CopyableCode code="add_domain_certificate" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-domainId"><code>domainId</code></a>, <a href="#parameter-privateKey"><code>privateKey</code></a>, <a href="#parameter-certificateChain"><code>certificateChain</code></a></td>
    <td></td>
    <td>This API allows you to upload a TLS certificate for a domain.<br /><br />If the ownership of the domain is not verified yet, this API will trigger<br />the verification process before storing the certificate.</td>
</tr>
<tr>
    <td><a href="#provision_domain_certificates"><CopyableCode code="provision_domain_certificates" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-domainId"><code>domainId</code></a></td>
    <td></td>
    <td>This API begins the provisioning of TLS certificates for a domain.<br /><br />Note that a call to this API may take a while, up to a minute or so.<br /><br />If the ownership of the domain is not verified yet, this API will trigger<br />the verification process before provisioning the certificate.</td>
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
</tbody>
</table>

## Lifecycle Methods

<Tabs
    defaultValue="add_domain_certificate"
    values={[
        { label: 'add_domain_certificate', value: 'add_domain_certificate' },
        { label: 'provision_domain_certificates', value: 'provision_domain_certificates' }
    ]}
>
<TabItem value="add_domain_certificate">

This API allows you to upload a TLS certificate for a domain.<br /><br />If the ownership of the domain is not verified yet, this API will trigger<br />the verification process before storing the certificate.

```sql
EXEC deno.domain.certificates.add_domain_certificate 
@domainId='{{ domainId }}' --required 
@@json=
'{
"privateKey": "{{ privateKey }}", 
"certificateChain": "{{ certificateChain }}"
}';
```
</TabItem>
<TabItem value="provision_domain_certificates">

This API begins the provisioning of TLS certificates for a domain.<br /><br />Note that a call to this API may take a while, up to a minute or so.<br /><br />If the ownership of the domain is not verified yet, this API will trigger<br />the verification process before provisioning the certificate.

```sql
EXEC deno.domain.certificates.provision_domain_certificates 
@domainId='{{ domainId }}' --required;
```
</TabItem>
</Tabs>
