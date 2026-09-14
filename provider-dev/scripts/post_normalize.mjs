#!/usr/bin/env node
// post_normalize.mjs
//
// Reverts the bare-array envelope that `@stackql/provider-utils` normalize
// (pass 1f, "wrapBareArrayResponses") applies to every operation whose 2xx
// response is a top-level `type: array`.
//
// Why this is needed for GitHub:
//
//   1. GitHub operationIds are `tag/op-id` (e.g. `issues/list-suggestions`).
//      Normalize derives the wrapper key and the wrapper schema name from the
//      operationId, producing `objectKey: $.issues/list_suggestions` and
//      `$ref: '#/components/schemas/Issues/list-suggestionsResponse'`. The
//      slash breaks both the JSONPath and the JSON pointer, so the generated
//      provider would not resolve.
//   2. stackql iterates bare-array JSON responses natively. The published
//      github provider has always shipped ~260 bare-array list endpoints
//      (repos, issues, contributors, releases, ...) with no objectKey and no
//      transform, and they work. The golang-template transform the wrap
//      emits adds runtime cost and risk for no functional gain here.
//
// The revert is exact: the synthesised wrapper schema holds the original
// array schema under `properties[<wrapperKey>]`, so we put that back as the
// response schema, delete the wrapper schema, and drop the marker. The pass
// is idempotent - re-running on already-unwrapped specs is a no-op.
//
// Usage: node provider-dev/scripts/post_normalize.mjs [--api-dir provider-dev/source] [--verbose]

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, extname, resolve } from 'path';
import yaml from 'js-yaml';

const MARKER = 'x-stackql-bare-array-wrap';
const OPS = new Set(['get', 'put', 'post', 'delete', 'patch', 'head', 'options', 'trace']);

function getArg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  if (i === -1) return fallback;
  return process.argv[i + 1] ?? fallback;
}

const apiDir = resolve(getArg('--api-dir', 'provider-dev/source'));
const verbose = process.argv.includes('--verbose');

let filesTouched = 0;
let unwrapped = 0;
const problems = [];

for (const f of readdirSync(apiDir)) {
  const ext = extname(f).toLowerCase();
  if (ext !== '.yaml' && ext !== '.yml') continue;
  const full = join(apiDir, f);
  const doc = yaml.load(readFileSync(full, 'utf8'));
  if (!doc || typeof doc !== 'object' || !doc.paths) continue;

  let changed = false;
  const schemas = doc.components?.schemas ?? {};

  for (const [p, pathItem] of Object.entries(doc.paths)) {
    if (!pathItem || typeof pathItem !== 'object') continue;
    for (const [verb, op] of Object.entries(pathItem)) {
      if (!OPS.has(verb) || !op || typeof op !== 'object') continue;
      const wrap = op[MARKER];
      if (!wrap || typeof wrap !== 'object') continue;

      const { wrapperKey, wrapperName, mediaType } = wrap;
      const wrapper = schemas[wrapperName];
      const original = wrapper?.properties?.[wrapperKey];
      if (!original) {
        problems.push(`${f} ${verb.toUpperCase()} ${p}: wrapper schema '${wrapperName}' / key '${wrapperKey}' not found`);
        continue;
      }

      // Restore the bare array schema on every 2xx response that refs the wrapper.
      for (const [code, resp] of Object.entries(op.responses ?? {})) {
        if (!/^2\d\d$/.test(code)) continue;
        const mt = resp?.content?.[mediaType];
        if (mt?.schema?.$ref === `#/components/schemas/${wrapperName}`) {
          mt.schema = original;
        }
      }
      delete schemas[wrapperName];
      delete op[MARKER];
      unwrapped++;
      changed = true;
      if (verbose) console.log(`unwrapped ${f} ${verb.toUpperCase()} ${p} (${wrapperKey})`);
    }
  }

  if (changed) {
    writeFileSync(full, yaml.dump(doc, { lineWidth: -1, noRefs: true }));
    filesTouched++;
  }
}

console.log(JSON.stringify({ apiDir, filesTouched, unwrapped, problems }, null, 2));
if (problems.length) process.exit(1);
