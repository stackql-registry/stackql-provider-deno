#!/usr/bin/env node
// preprocess.mjs
//
// Lowers the Deno Deploy API v2 document (OpenAPI 3.1.1, served at
// https://api.deno.com/v2/openapi.json) to the OpenAPI 3.0 dialect that
// @stackql/provider-utils and stackql's loader (any-sdk on kin-openapi)
// consume, writing provider-dev/downloaded/openapi.json. Deterministic and
// idempotent; both files are committed so a refresh is a reviewed diff.
//
// Rules (see NOTES.md 2):
//   1. anyOf / oneOf lowering
//        - `{type: null}` members are removed and recorded as `nullable: true`
//        - a single remaining member is merged into the parent node (a $ref
//          member becomes `allOf: [{$ref}]` so sibling keywords survive)
//        - members that are all the same scalar type collapse to that type
//          (enum / const values are combined)
//        - members that are all objects are kept as `oneOf` for the
//          provider-utils normalize pass to merge (union of properties)
//        - any other mix (boolean | object, "all" | array, ...) becomes
//          `type: string` and is documented as a JSON value
//   2. `const: x` -> `enum: [x]` (plus `type` inferred from the value)
//   3. `examples: [...]` (3.1 schema keyword) -> `example: first`
//   4. `propertyNames` is dropped (no 3.0 equivalent; keys are strings)
//   5. `enum` without `type` gets the type of its first value
//   6. the `labels` query parameter on GET /v2/apps is removed: the API
//      expects deep-object `labels[key]=value` pairs, which a single-valued
//      SQL predicate cannot express - filter on the `labels` column locally
//   7. the `text/event-stream` response variant of the two streaming
//      endpoints is dropped so the JSON Lines variant (`application/x-ndjson`)
//      is the one the generator binds; post_process.mjs turns the JSONL body
//      into rows
//   8. required query parameters become optional at the SQL surface (the
//      API still enforces them). stackql does not register a required query
//      parameter as a WHERE symbol, so `start` on GET /v2/apps/{app}/logs
//      could not be supplied at all; the description records that the API
//      requires it
//
// Usage: node provider-dev/scripts/preprocess.mjs [in.json] [out.json]

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const inPath = resolve(process.argv[2] || 'provider-dev/downloaded/deno-api-v2.json');
const outPath = resolve(process.argv[3] || 'provider-dev/downloaded/openapi.json');

const doc = JSON.parse(readFileSync(inPath, 'utf8'));
const stats = { nullable: 0, singleMember: 0, scalarUnion: 0, objectUnion: 0, mixedToString: 0, const: 0, examples: 0, propertyNames: 0, enumType: 0, paramsDropped: 0, sseDropped: 0, requiredQueryRelaxed: 0 };
const problems = [];

const SCALARS = new Set(['string', 'integer', 'number', 'boolean']);
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const typeOfValue = (v) => (typeof v === 'boolean' ? 'boolean' : typeof v === 'number' ? (Number.isInteger(v) ? 'integer' : 'number') : 'string');
const scalarType = (m) => {
  if (!isObj(m) || m.$ref || m.properties || m.items || m.oneOf || m.anyOf || m.allOf) return null;
  if (typeof m.type === 'string' && SCALARS.has(m.type)) return m.type;
  if (Array.isArray(m.enum) && m.enum.length) return typeOfValue(m.enum[0]);
  if ('const' in m) return typeOfValue(m.const);
  return null;
};
const isObjectLike = (m) => isObj(m) && (m.$ref || m.type === 'object' || m.properties || m.allOf || m.oneOf || m.anyOf);

function lowerVariants(node) {
  for (const kw of ['anyOf', 'oneOf']) {
    if (!Array.isArray(node[kw])) continue;
    const members = node[kw];
    const rest = members.filter((m) => !(isObj(m) && m.type === 'null'));
    if (rest.length !== members.length) { node.nullable = true; stats.nullable++; }
    delete node[kw];
    if (rest.length === 0) { node.type = 'string'; continue; }
    if (rest.length === 1) {
      const m = rest[0];
      if (m.$ref) {
        node.allOf = [{ $ref: m.$ref }];
      } else {
        for (const [k, v] of Object.entries(m)) {
          if (!(k in node) || ['type', 'enum', 'items', 'properties', 'required', 'additionalProperties', 'format'].includes(k)) node[k] = v;
        }
      }
      stats.singleMember++;
      continue;
    }
    const scalarTypes = rest.map(scalarType);
    if (scalarTypes.every((t) => t && t === scalarTypes[0])) {
      node.type = scalarTypes[0];
      const enums = rest.flatMap((m) => (Array.isArray(m.enum) ? m.enum : 'const' in m ? [m.const] : []));
      if (enums.length && rest.every((m) => Array.isArray(m.enum) || 'const' in m)) node.enum = [...new Set(enums)];
      if (!node.description) {
        const d = rest.map((m) => m.description).filter(Boolean).join(' / ');
        if (d) node.description = d;
      }
      stats.scalarUnion++;
      continue;
    }
    if (rest.every(isObjectLike)) {
      node.oneOf = rest;
      stats.objectUnion++;
      continue;
    }
    const shapes = rest.map((m) => scalarType(m) || (m.type === 'array' ? 'array' : 'object'));
    node.type = 'string';
    delete node.items;
    delete node.properties;
    const note = `(JSON value: ${[...new Set(shapes)].join(' or ')})`;
    node.description = node.description ? `${node.description} ${note}` : note;
    stats.mixedToString++;
  }
}

function walk(node, trail = '$') {
  if (Array.isArray(node)) { node.forEach((v, i) => walk(v, `${trail}[${i}]`)); return; }
  if (!isObj(node)) return;
  lowerVariants(node);
  if ('const' in node) {
    node.enum = [node.const];
    if (!node.type) node.type = typeOfValue(node.const);
    delete node.const;
    stats.const++;
  }
  // `examples` is a schema keyword in 3.1 (an array of example values); in
  // 3.0 the schema keyword is the singular `example`. Parameter / media type
  // objects also carry `examples` in 3.0 but as a map, which the Deno
  // document does not use, so every array-valued `examples` is a schema one.
  if (Array.isArray(node.examples)) {
    if (!('example' in node)) node.example = node.examples[0];
    delete node.examples;
    stats.examples++;
  }
  if ('propertyNames' in node) { delete node.propertyNames; stats.propertyNames++; }
  if (Array.isArray(node.enum) && !node.type && node.enum.length) { node.type = typeOfValue(node.enum[0]); stats.enumType++; }
  if (Array.isArray(node.type)) problems.push(`${trail}: unexpected type array ${JSON.stringify(node.type)}`);
  for (const [k, v] of Object.entries(node)) walk(v, `${trail}.${k}`);
}

// 6. deep-object label filter on GET /v2/apps
const appsList = doc.paths?.['/v2/apps']?.get;
if (appsList?.parameters) {
  const before = appsList.parameters.length;
  appsList.parameters = appsList.parameters.filter((p) => !(p.in === 'query' && p.name === 'labels'));
  stats.paramsDropped += before - appsList.parameters.length;
}

// 7. streaming endpoints: keep the JSON Lines variant only
// 8. required query parameters -> optional at the SQL surface
for (const [p, item] of Object.entries(doc.paths)) {
  for (const [verb, op] of Object.entries(item)) {
    if (!['get', 'post', 'put', 'patch', 'delete'].includes(verb)) continue;
    for (const [code, resp] of Object.entries(op.responses || {})) {
      const content = resp?.content;
      if (content && content['text/event-stream'] && content['application/x-ndjson']) {
        delete content['text/event-stream'];
        stats.sseDropped++;
      }
    }
    for (const param of op.parameters || []) {
      if (param.in === 'query' && param.required === true) {
        delete param.required;
        const note = 'Required by the API on every request.';
        param.description = param.description ? `${param.description} ${note}` : note;
        stats.requiredQueryRelaxed++;
      }
    }
  }
}

walk(doc);

// Sanity: every operation still has an operationId and a 2xx response.
for (const [p, item] of Object.entries(doc.paths)) {
  for (const [verb, op] of Object.entries(item)) {
    if (!['get', 'post', 'put', 'patch', 'delete'].includes(verb)) continue;
    if (!op.operationId) problems.push(`${verb.toUpperCase()} ${p}: no operationId`);
    if (!Object.keys(op.responses || {}).some((c) => /^2\d\d$/.test(c))) problems.push(`${verb.toUpperCase()} ${p}: no 2xx response`);
  }
}

if (problems.length) {
  console.error(`preprocess FAILED with ${problems.length} problem(s), nothing written:`);
  for (const x of problems) console.error(`  ${x}`);
  process.exit(1);
}
writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n');
console.log(JSON.stringify({ inPath, outPath, openapi: doc.openapi, version: doc.info?.version, paths: Object.keys(doc.paths).length, ...stats }, null, 2));
