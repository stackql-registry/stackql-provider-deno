--- 
title: domains
hide_title: false
hide_table_of_contents: false
keywords:
  - domains
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

Creates, updates, deletes, gets or lists a <code>domains</code> resource.

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><CopyableCode code="domains" /></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="deno.domains.domains" /></td></tr>
</tbody></table>

## Fields

The following fields are returned by `SELECT` queries:

<Tabs
    defaultValue="get"
    values={[
        { label: 'get', value: 'get' },
        { label: 'list', value: 'list' }
    ]}
>
<TabItem value="get">

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
    <td>Unique domain identifier (UUID)</td>
</tr>
<tr>
    <td><CopyableCode code="organization_id" /></td>
    <td><code>string</code></td>
    <td>Organization that owns the domain</td>
</tr>
<tr>
    <td><CopyableCode code="certificates" /></td>
    <td><code>array</code></td>
    <td>Currently stored certificates for this domain</td>
</tr>
<tr>
    <td><CopyableCode code="created_at" /></td>
    <td><code>string</code></td>
    <td>ISO 8601 timestamp of creation</td>
</tr>
<tr>
    <td><CopyableCode code="dns_records" /></td>
    <td><code>array</code></td>
    <td>Alternative sets of DNS records to publish for verification and routing. Each inner array is one complete, self-sufficient option — publish every record from a single option (e.g. the `CNAME` option *or* the `A`/`AAAA` option), not a mix across options. The `_acme-challenge` verification record is required regardless of the option chosen, so it is included in every option.</td>
</tr>
<tr>
    <td><CopyableCode code="domain" /></td>
    <td><code>string</code></td>
    <td>The bare hostname (e.g. `shop.acme.com`). Wildcard coverage is reported via `kind`, never as a `*.` literal in this field.</td>
</tr>
<tr>
    <td><CopyableCode code="is_validated" /></td>
    <td><code>boolean</code></td>
    <td>True once DNS-based ownership has been confirmed</td>
</tr>
<tr>
    <td><CopyableCode code="kind" /></td>
    <td><code>string</code></td>
    <td>Whether the domain covers the apex, a wildcard, or both (base_only, wildcard_only, base_and_wildcard)</td>
</tr>
<tr>
    <td><CopyableCode code="provisioning_status" /></td>
    <td><code>object</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="updated_at" /></td>
    <td><code>string</code></td>
    <td>ISO 8601 timestamp of last modification</td>
</tr>
<tr>
    <td><CopyableCode code="verification_token" /></td>
    <td><code>string</code></td>
    <td>Token to publish under `_acme-challenge.&lt;domain&gt;` for ownership verification</td>
</tr>
</tbody>
</table>
</TabItem>
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
    <td>Unique domain identifier (UUID)</td>
</tr>
<tr>
    <td><CopyableCode code="organization_id" /></td>
    <td><code>string</code></td>
    <td>Organization that owns the domain</td>
</tr>
<tr>
    <td><CopyableCode code="certificates" /></td>
    <td><code>array</code></td>
    <td>Currently stored certificates for this domain</td>
</tr>
<tr>
    <td><CopyableCode code="created_at" /></td>
    <td><code>string</code></td>
    <td>ISO 8601 timestamp of creation</td>
</tr>
<tr>
    <td><CopyableCode code="dns_records" /></td>
    <td><code>array</code></td>
    <td>Alternative sets of DNS records to publish for verification and routing. Each inner array is one complete, self-sufficient option — publish every record from a single option (e.g. the `CNAME` option *or* the `A`/`AAAA` option), not a mix across options. The `_acme-challenge` verification record is required regardless of the option chosen, so it is included in every option.</td>
</tr>
<tr>
    <td><CopyableCode code="domain" /></td>
    <td><code>string</code></td>
    <td>The bare hostname (e.g. `shop.acme.com`). Wildcard coverage is reported via `kind`, never as a `*.` literal in this field.</td>
</tr>
<tr>
    <td><CopyableCode code="is_validated" /></td>
    <td><code>boolean</code></td>
    <td>True once DNS-based ownership has been confirmed</td>
</tr>
<tr>
    <td><CopyableCode code="kind" /></td>
    <td><code>string</code></td>
    <td>Whether the domain covers the apex, a wildcard, or both (base_only, wildcard_only, base_and_wildcard)</td>
</tr>
<tr>
    <td><CopyableCode code="provisioning_status" /></td>
    <td><code>object</code></td>
    <td></td>
</tr>
<tr>
    <td><CopyableCode code="updated_at" /></td>
    <td><code>string</code></td>
    <td>ISO 8601 timestamp of last modification</td>
</tr>
<tr>
    <td><CopyableCode code="verification_token" /></td>
    <td><code>string</code></td>
    <td>Token to publish under `_acme-challenge.&lt;domain&gt;` for ownership verification</td>
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
    <td><a href="#get"><CopyableCode code="get" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td><a href="#parameter-domain"><code>domain</code></a></td>
    <td></td>
    <td>Fetch a single domain by its id or name (e.g. `example.com`).</td>
</tr>
<tr>
    <td><a href="#list"><CopyableCode code="list" /></a></td>
    <td><CopyableCode code="select" /></td>
    <td></td>
    <td><a href="#parameter-search"><code>search</code></a>, <a href="#parameter-cursor"><code>cursor</code></a>, <a href="#parameter-limit"><code>limit</code></a></td>
    <td>List domains registered to the authenticated organization.</td>
</tr>
<tr>
    <td><a href="#create"><CopyableCode code="create" /></a></td>
    <td><CopyableCode code="insert" /></td>
    <td><a href="#parameter-domain"><code>domain</code></a></td>
    <td></td>
    <td>Register a hostname to the authenticated organization. Provide the bare hostname (e.g. `acme.com`) — never a `*.` wildcard literal — and use `kind` to control whether the apex, its wildcard subdomains, or both are served. Returns the verification token and the DNS records the user must publish.</td>
</tr>
<tr>
    <td><a href="#delete"><CopyableCode code="delete" /></a></td>
    <td><CopyableCode code="delete" /></td>
    <td><a href="#parameter-domain"><code>domain</code></a></td>
    <td></td>
    <td>Permanently remove a domain and all associated bindings. Accepts the domain id or name.</td>
</tr>
<tr>
    <td><a href="#verify"><CopyableCode code="verify" /></a></td>
    <td><CopyableCode code="exec" /></td>
    <td><a href="#parameter-domain"><code>domain</code></a></td>
    <td></td>
    <td>Re-run DNS-based ownership verification against the records the user published. Returns the refreshed domain. Accepts the domain id or name.</td>
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
<tr id="parameter-search">
    <td><CopyableCode code="search" /></td>
    <td><code>string</code></td>
    <td>The search query for filtering</td>
</tr>
</tbody>
</table>

## `SELECT` examples

<Tabs
    defaultValue="get"
    values={[
        { label: 'get', value: 'get' },
        { label: 'list', value: 'list' }
    ]}
>
<TabItem value="get">

Fetch a single domain by its id or name (e.g. `example.com`).

```sql
SELECT
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
FROM deno.domains.domains
WHERE domain = '{{ domain }}' -- required
;
```
</TabItem>
<TabItem value="list">

List domains registered to the authenticated organization.

```sql
SELECT
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
FROM deno.domains.domains
WHERE search = '{{ search }}'
AND cursor = '{{ cursor }}'
AND limit = '{{ limit }}'
;
```
</TabItem>
</Tabs>


## `INSERT` examples

<Tabs
    defaultValue="create"
    values={[
        { label: 'create', value: 'create' },
        { label: 'Manifest', value: 'manifest' }
    ]}
>
<TabItem value="create">

Register a hostname to the authenticated organization. Provide the bare hostname (e.g. `acme.com`) — never a `*.` wildcard literal — and use `kind` to control whether the apex, its wildcard subdomains, or both are served. Returns the verification token and the DNS records the user must publish.

```sql
INSERT INTO deno.domains.domains (
domain,
kind
)
SELECT 
'{{ domain }}' /* required */,
'{{ kind }}'
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
- name: domains
  props:
    - name: domain
      value: "{{ domain }}"
      description: |
        Bare hostname to register, e.g. \`shop.acme.com\` — without a \`*.\` prefix. Wildcard coverage is selected via \`kind\`, not by putting a \`*\` label in the hostname.
    - name: kind
      value: "{{ kind }}"
      description: |
        Whether the domain covers the apex, a wildcard, or both. Defaults to \`base_only\`. To serve \`*.preview.acme.com\`, register \`preview.acme.com\` with \`wildcard_only\` (wildcard subdomains only) or \`base_and_wildcard\` (apex plus wildcard).
      valid_values: ['base_only', 'wildcard_only', 'base_and_wildcard']
`}</CodeBlock>

</TabItem>
</Tabs>


## `DELETE` examples

<Tabs
    defaultValue="delete"
    values={[
        { label: 'delete', value: 'delete' }
    ]}
>
<TabItem value="delete">

Permanently remove a domain and all associated bindings. Accepts the domain id or name.

```sql
DELETE FROM deno.domains.domains
WHERE domain = '{{ domain }}' --required
;
```
</TabItem>
</Tabs>


## Lifecycle Methods

<Tabs
    defaultValue="verify"
    values={[
        { label: 'verify', value: 'verify' }
    ]}
>
<TabItem value="verify">

Re-run DNS-based ownership verification against the records the user published. Returns the refreshed domain. Accepts the domain id or name.

```sql
EXEC deno.domains.domains.verify 
@domain='{{ domain }}' --required
;
```
</TabItem>
</Tabs>
