// svc-discriminator.mjs
//
// operationId -> service map for `provider-dev-utils split --svc-discriminator
// function`. The Deno Deploy API v2 tags its operations `apps`, `revisions`,
// `layers`, `domains` and `databases` (plus an `environment variables` tag
// that carries no operations); the operationId prefix carries the same
// grouping, with one exception routed here:
//
//   apps.deploy   POST /v2/apps/{app}/deploy creates a revision, so it lives
//                 in the `revisions` service as revisions.deploy (INSERT) next
//                 to the revision reads it produces
//
// Signature: (pathKey, operationId, tags, { providerName, pathItem, operation }) => serviceName
//
// An operationId this map does not know FAILS the split, so a spec refresh
// that adds endpoints is a deliberate, reviewed decision.

const SERVICES = new Set(['apps', 'revisions', 'layers', 'domains', 'databases']);
const OVERRIDES = {
  'apps.deploy': 'revisions',
};

export default function serviceFor(pathKey, operationId) {
  if (!operationId) throw new Error(`svc-discriminator: ${pathKey} has no operationId`);
  if (OVERRIDES[operationId]) return OVERRIDES[operationId];
  const prefix = operationId.split('.')[0];
  if (!SERVICES.has(prefix)) {
    throw new Error(`svc-discriminator: no service for ${operationId} (${pathKey}) - add it to provider-dev/scripts/svc-discriminator.mjs`);
  }
  return prefix;
}
