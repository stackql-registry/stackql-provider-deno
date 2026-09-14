--- 
title: certificates
hide_title: false
hide_table_of_contents: false
keywords:
  - certificates
  - domains
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

Creates, updates, deletes, gets or lists a <code>certificates</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="certificates" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="deno.domains.certificates" /></td></tr>
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
    <td><code>string</code></td>
    <td>Certificate identifier</td>
</tr>
<tr>
    <td><CopyableCode code="created_at" /></td>
    <td><code>string</code></td>
    <td>ISO 8601 timestamp of when the certificate was stored</td>
</tr>
<tr>
    <td><CopyableCode code="kind" /></td>
    <td><code>string</code></td>
    <td>`automatic` for ACME-provisioned certificates, `manual` for user-uploaded ones (automatic, manual)</td>
</tr>
<tr>
    <td><CopyableCode code="not_valid_after" /></td>
    <td><code>string</code></td>
    <td>ISO 8601 end of validity window</td>
</tr>
<tr>
    <td><CopyableCode code="not_valid_before" /></td>
    <td><code>string</code></td>
    <td>ISO 8601 start of validity window</td>
</tr>
<tr>
    <td><CopyableCode code="private_key_algorithm" /></td>
    <td><code>string</code></td>
    <td>Private key algorithm (ec-p256, ec-p384, ec-p521, rsa-2048, rsa-3072, rsa-4096)</td>
</tr>
<tr>
    <td><CopyableCode code="subject_alt_names" /></td>
    <td><code>array</code></td>
    <td>All hostnames covered by this certificate</td>
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
    <td><a href="#parameter-domain"><code>domain</code></a></td>
    <td></td>
    <td>Returns the current certificate set plus the latest provisioning attempt's status. Clients poll this endpoint to observe progress of an in-flight provisioning request. Accepts the domain id or name.</td>
</tr>
<tr>
    <td><a href="#upload"><CopyableCode code="upload" /></a></td>
    <td><CopyableCode code="insert" /></td>
    <td><a href="#parameter-domain"><code>domain</code></a>, <a href="#parameter-certificate"><code>certificate</code></a>, <a href="#parameter-private_key"><code>private_key</code></a></td>
    <td></td>
    <td>Upload a PEM-encoded certificate and private key. The server validates that the certificate covers the domain and that the key algorithm is RSA-2048 or EC P-256. Accepts the domain id or name.</td>
</tr>
<tr>
    <td><a href="#provision"><CopyableCode code="provision" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-domain"><code>domain</code></a></td>
    <td></td>
    <td>Schedules an ACME-based certificate to be provisioned for the domain. Returns immediately with `202 Accepted`; poll `GET /domains/&#123;domain&#125;/certificates` for status. Accepts the domain id or name.</td>
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
<tr id="parameter-domain">
    <td><CopyableCode code="domain" /></td>
    <td><code>string</code></td>
    <td>The domain ID or name (e.g. `example.com`). Domain IDs are UUIDs.</td>
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

Returns the current certificate set plus the latest provisioning attempt's status. Clients poll this endpoint to observe progress of an in-flight provisioning request. Accepts the domain id or name.

```sql
SELECT
id,
created_at,
kind,
not_valid_after,
not_valid_before,
private_key_algorithm,
subject_alt_names
FROM deno.domains.certificates
WHERE domain = '{{ domain }}' -- required
;
```
</TabItem>
</Tabs>


## `INSERT` examples

<Tabs
    defaultValue="upload"
    values={[
        { label: 'upload', value: 'upload' },
        { label: 'Manifest', value: 'manifest' }
    ]}
>
<TabItem value="upload">

Upload a PEM-encoded certificate and private key. The server validates that the certificate covers the domain and that the key algorithm is RSA-2048 or EC P-256. Accepts the domain id or name.

```sql
INSERT INTO deno.domains.certificates (
certificate,
private_key,
domain
)
SELECT 
'{{ certificate }}' /* required */,
'{{ private_key }}' /* required */,
'{{ domain }}'
RETURNING
id,
organization_id,
certificates,
created_at,
dns_records,
domain,
is_validated,
kind,
provisioning_status,
updated_at,
verification_token
;
```
</TabItem>
<TabItem value="manifest">

<CodeBlock language="yaml">{`# Description fields are for documentation purposes
- name: certificates
  props:
    - name: domain
      value: "{{ domain }}"
      description: Required parameter for the certificates resource.
    - name: certificate
      value: "{{ certificate }}"
      description: |
        PEM-encoded certificate (full chain)
    - name: private_key
      value: "{{ private_key }}"
      description: |
        PEM-encoded private key matching the certificate
`}</CodeBlock>

</TabItem>
</Tabs>


## Lifecycle Methods

<Tabs
    defaultValue="provision"
    values={[
        { label: 'provision', value: 'provision' }
    ]}
>
<TabItem value="provision">

Schedules an ACME-based certificate to be provisioned for the domain. Returns immediately with `202 Accepted`; poll `GET /domains/&#123;domain&#125;/certificates` for status. Accepts the domain id or name.

```sql
EXEC deno.domains.certificates.provision 
@domain='{{ domain }}' --required
;
```
</TabItem>
</Tabs>
