---
title: deno
hide_title: false
hide_table_of_contents: false
keywords:
  - deno
  - deno deploy
  - stackql
  - infrastructure-as-code
  - configuration-as-data
  - cloud inventory
description: Query, deploy and manage Deno Deploy resources using SQL
custom_edit_url: null
image: /img/stackql-deno-provider-featured-image.png
id: 'provider-intro'
---

import CopyableCode from '@site/src/components/CopyableCode/CopyableCode';

Deno Deploy provider for StackQL, enabling SQL-based management of your serverless JavaScript/TypeScript deployments, projects, domains, and KV databases in a globally distributed edge runtime.

:::info[Provider Summary] 

total services: __5__  
total resources: __17__  

:::

See also:   
[[` SHOW `]](https://stackql.io/docs/language-spec/show) [[` DESCRIBE `]](https://stackql.io/docs/language-spec/describe)  [[` REGISTRY `]](https://stackql.io/docs/language-spec/registry)
* * * 

## Installation

To pull the latest version of the `deno` provider, run the following command:  

```bash
REGISTRY PULL deno;
```
> To view previous provider versions or to pull a specific provider version, see [here](https://stackql.io/docs/language-spec/registry).  

## Authentication

The following system environment variables are used for authentication by default:  

- <CopyableCode code="DENO_DEPLOY_TOKEN" /> - Deno Deploy API token (see <a href="https://docs.deno.com/subhosting/api/authentication/">deno Deploy Authentication</a>)
  
These variables are sourced at runtime (from the local machine or as CI variables/secrets).  

<details>

<summary>Using different environment variables</summary>

To use different environment variables (instead of the defaults), use the `--auth` flag of the `stackql` program.  For example:  

```bash

AUTH='{ "deno": { "type": "bearer",  "credentialsenvvar": "YOUR_DENO_DEPLOY_TOKEN_VAR" }}'
stackql shell --auth="${AUTH}"

```
or using PowerShell:  

```powershell

$Auth = "{ 'deno': { 'type': 'bearer',  'credentialsenvvar': 'YOUR_DENO_DEPLOY_TOKEN_VAR' }}"
stackql.exe shell --auth=$Auth

```
</details>

## Services
<div class="row">
<div class="providerDocColumn">
<a href="/services/database/">database</a><br />
<a href="/services/deployment/">deployment</a><br />
<a href="/services/domain/">domain</a><br />
</div>
<div class="providerDocColumn">
<a href="/services/organization/">organization</a><br />
<a href="/services/project/">project</a><br />
</div>
</div>
