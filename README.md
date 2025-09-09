## `deno` provider for [`stackql`](https://github.com/stackql/stackql)

This repository is used to generate and document the `deno` provider for StackQL, allowing you to query and manipulate Deno Deploy resources using SQL-like syntax. The provider is built using the `@stackql/provider-utils` package, which provides tools for converting OpenAPI specifications into StackQL-compatible provider schemas.

The `@stackql/provider-utils` package offers several utilities that this provider uses:
- `split` - Divides a large OpenAPI spec into smaller service-specific files
- `analyze` - Examines OpenAPI specs and generates mapping configuration files
- `generate` - Creates StackQL provider extensions from OpenAPI specs and mappings
- `docgen` - Builds documentation for the provider

### Prerequisites

To use the Deno Deploy provider with StackQL, you'll need:

1. A Deno Deploy account with appropriate API credentials
2. A Deno Deploy API token with sufficient permissions for the resources you want to access
3. StackQL CLI installed on your system (see [StackQL](https://github.com/stackql/stackql))

### 1. Download the Open API Specification

First, download the Deno Deploy API OpenAPI specification:

```bash
curl -L https://api.deno.com/v1/openapi.json \
  -o provider-dev/downloaded/deno-api.json
```

This downloads the official Deno Deploy API specification, which defines all available API endpoints, request parameters, and response schemas.

### 2. Split into Service Specs

Next, split the monolithic OpenAPI specification into service-specific files:

```bash
npm run split -- \
  --provider-name deno \
  --api-doc provider-dev/downloaded/deno-api.json \
  --svc-discriminator tag \
  --output-dir provider-dev/source \
  --overwrite \
  --svc-name-overrides "$(cat <<EOF
{
  "databasebackup": "database"
}
EOF
)"
```

This step breaks down the Deno Deploy API specification into smaller, more manageable service files. The `--svc-discriminator tag` option tells the tool to use the OpenAPI tags to determine which API endpoints belong to which service. For Deno Deploy, this creates separate files for different functional areas like organizations, projects, deployments, domains, and databases.

### 3. Generate Mappings

Generate the mapping configuration that connects OpenAPI operations to StackQL resources:

```bash
npm run generate-mappings -- \
  --provider-name deno \
  --input-dir provider-dev/source \
  --output-dir provider-dev/config
```

This step analyzes the service specs and creates a CSV mapping file that defines how OpenAPI operations translate to StackQL resources, methods, and SQL verbs. The mapping process handles two scenarios:

1. **New Provider Development**: If no mapping file exists yet, this creates a new `all_services.csv` file with all operations from the OpenAPI spec. You'll need to edit this file to assign appropriate resource names, method names, and SQL verbs.

2. **Updating Existing Mappings**: If a mapping file already exists, the tool will:
   - Load the existing mappings
   - Identify new operations that aren't yet mapped
   - Flag operations with incomplete mappings (missing resource, method, or SQL verb)
   - Skip operations that are already fully mapped

Update the resultant `provider-dev/config/all_services.csv` to add the `stackql_resource_name`, `stackql_method_name`, `stackql_verb` values for each operation.

### 4. Generate Provider

This step transforms the split OpenAPI service specs into a fully-functional StackQL provider by applying the resource and method mappings defined in your CSV file.

```bash
npm run generate-provider -- \
  --provider-name deno \
  --input-dir provider-dev/source \
  --output-dir provider-dev/openapi/src/deno \
  --config-path provider-dev/config/all_services.csv \
  --servers '[{"url": "https://api.deno.com/v1"}]' \
  --provider-config '{"auth": {"credentialsenvvar": "DENO_DEPLOY_TOKEN","type": "bearer"}}' \
  --overwrite
```

Make necessary updates to the output docs:

```bash
sh provider-dev/scripts/fix_broken_links.sh
```

The `--servers` parameter defines the base URL for API requests. For Deno Deploy, this sets the API endpoint to the v1 API.

The `--provider-config` parameter sets up the authentication method. For Deno Deploy, this configures a bearer token authentication scheme that:
- Looks for the API token in the `DENO_DEPLOY_TOKEN` environment variable
- Uses the token as a bearer token in the Authorization header

The generated provider will be structured according to the StackQL conventions, with properly organized resources and methods that map to the underlying API operations.

After running this command, you'll have a complete provider structure in the `provider-dev/openapi/src` directory, ready for testing or packaging.

### 5. Test Provider

#### Starting the StackQL Server

Before running tests, start a StackQL server with your provider:

```bash
PROVIDER_REGISTRY_ROOT_DIR="$(pwd)/provider-dev/openapi"
npm run start-server -- --provider deno --registry $PROVIDER_REGISTRY_ROOT_DIR
```

#### Test Meta Routes

Test all metadata routes (services, resources, methods) in the provider:

```bash
npm run test-meta-routes -- deno --verbose
```

When you're done testing, stop the StackQL server:

```bash
npm run stop-server
```

Use this command to view the server status:

```bash
npm run server-status
```

#### Run test queries

Run some test queries against the provider using the `stackql shell`:

```bash
PROVIDER_REGISTRY_ROOT_DIR="$(pwd)/provider-dev/openapi"
REG_STR='{"url": "file://'${PROVIDER_REGISTRY_ROOT_DIR}'", "localDocRoot": "'${PROVIDER_REGISTRY_ROOT_DIR}'", "verifyConfig": {"nopVerify": true}}'
./stackql shell --registry="${REG_STR}"
```

Example queries to try:

```sql
SELECT * FROM deno.organization.organizations where organizationId = 'eb8e43a8-864b-4b18-a53b-f9c5ce83f2f1'; -- replace with your org id

SELECT *
FROM deno.project.projects
WHERE organizationId = 'eb8e43a8-864b-4b18-a53b-f9c5ce83f2f1';

SELECT
id,
description,
status,
JSON_EXTRACT(domains, '$[0]') as domain,
JSON_EXTRACT("databases", '$.default') as db_id,
createdAt,
updatedAt
FROM deno.deployment.deployments
WHERE projectId = '616de983-3e37-4f44-a99f-b6bb5c59e80a' -- replace with your projectId
AND "order" = 'desc';

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
WHERE organizationId = 'eb8e43a8-864b-4b18-a53b-f9c5ce83f2f1';
```

### 6. Publish the provider

To publish the provider push the `deno` dir to `providers/src` in a feature branch of the [`stackql-provider-registry`](https://github.com/stackql/stackql-provider-registry). Follow the [registry release flow](https://github.com/stackql/stackql-provider-registry/blob/dev/docs/build-and-deployment.md).  

Launch the StackQL shell:

```bash
export DEV_REG="{ \"url\": \"https://registry-dev.stackql.app/providers\" }"
./stackql --registry="${DEV_REG}" shell
```

pull the latest dev `deno` provider:

```sql
registry pull deno;
```

Run some test queries to verify the provider works as expected.

### 7. Generate web docs

Provider doc microsites are built using Docusaurus and published using GitHub Pages.  

a. Update `headerContent1.txt` and `headerContent2.txt` accordingly in `provider-dev/docgen/provider-data/`  

b. Update the following in `website/docusaurus.config.js`:  

```js
// Provider configuration - change these for different providers
const providerName = "deno";
const providerTitle = "Deno Deploy Provider";
```

c. Then generate docs using...

```bash
npm run generate-docs -- \
  --provider-name deno \
  --provider-dir ./provider-dev/openapi/src/deno/v00.00.00000 \
  --output-dir ./website \
  --provider-data-dir ./provider-dev/docgen/provider-data
```  

### 8. Test web docs locally

```bash
cd website
# test build
yarn build

# run local dev server
yarn start
```

### 9. Publish web docs to GitHub Pages

Under __Pages__ in the repository, in the __Build and deployment__ section select __GitHub Actions__ as the __Source__. In Netlify DNS create the following records:

| Source Domain | Record Type  | Target |
|---------------|--------------|--------|
| deno-provider.stackql.io | CNAME | stackql.github.io. |

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.