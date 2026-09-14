#!/usr/bin/env node
// map_operations.mjs
//
// Fills in stackql_resource_name / stackql_method_name / stackql_verb /
// stackql_object_key for operations in provider-dev/config/all_services.csv
// that `generate-mappings` (analyze) left unmapped after a spec refresh.
// Mappings are recorded here as data so a refresh is a reviewed diff rather
// than a hand edit of the CSV. Rows that are already mapped are left alone
// (the checked-in CSV is the durable record of the operation -> resource
// wiring; changing an existing row is a deliberate, reviewed edit - a
// resource rename or an operation moving between resources is a breaking
// change for users and needs a note in NOTES.md).
//
// The script also prunes rows for operations Deno has retired, resyncs rows
// whose path moved upstream, and reports mapped rows that disagree with this
// table so drift between the two is visible. It FAILS if any live operation
// is still unmapped - add it to the table below and re-run.
//
// Usage: node provider-dev/scripts/map_operations.mjs [--csv provider-dev/config/all_services.csv] [--source-dir provider-dev/source]

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join, extname } from 'path';
import yaml from 'js-yaml';

const csvArgIdx = process.argv.indexOf('--csv');
const csvPath = resolve(csvArgIdx === -1 ? 'provider-dev/config/all_services.csv' : process.argv[csvArgIdx + 1]);
const srcArgIdx = process.argv.indexOf('--source-dir');
const sourceDir = resolve(srcArgIdx === -1 ? 'provider-dev/source' : process.argv[srcArgIdx + 1]);

// Collect every operationId present in the split specs. `analyze` carries
// previously mapped rows forward even when the operation has been removed
// upstream, so rows not in this set are pruned (and reported).
const liveOps = new Map();
for (const f of readdirSync(sourceDir)) {
  if (!['.yaml', '.yml'].includes(extname(f).toLowerCase())) continue;
  const doc = yaml.load(readFileSync(join(sourceDir, f), 'utf8'));
  for (const [p, pathItem] of Object.entries(doc?.paths ?? {})) {
    for (const [verb, op] of Object.entries(pathItem ?? {})) {
      if (op && typeof op === 'object' && typeof op.operationId === 'string') {
        liveOps.set(op.operationId, { filename: f, path: p, verb });
      }
    }
  }
}

// operationId -> [resource, method, verb, objectKey]
//
// Conventions:
//   - resources are plural snake_case nouns named after the API's own
//     objects (apps, revisions, layers, domains, certificates, ...)
//   - lifecycle operations (cancel, promote, verify, provision, attach /
//     detach a domain) are `exec` methods on the resource they act on rather
//     than resources of their own, so every resource but one is selectable
//     (database_instances only has a create endpoint upstream)
//   - GET collection -> select `list`, GET single -> select `get`, POST ->
//     insert `create`, PATCH -> update, DELETE -> delete
//   - POST /v2/apps/{app}/deploy creates a revision and returns it, so it is
//     the INSERT method (`deploy`) of the revisions resource
//   - objectKey names the array inside an envelope response; the two
//     streaming endpoints and the analytics table are rewritten to an
//     envelope by post_process.mjs, so their objectKey points at that
//     synthetic key. Bare-array lists carry no objectKey (stackql iterates
//     bare arrays natively; post_normalize.mjs reverts the normalizer's wrap)
const M = {
  // ----------------------------------------------------------------- apps
  'apps.list': ['apps', 'list', 'select', ''],
  'apps.get': ['apps', 'get', 'select', ''],
  'apps.create': ['apps', 'create', 'insert', ''],
  'apps.update': ['apps', 'update', 'update', ''],
  'apps.delete': ['apps', 'delete', 'delete', ''],
  'apps.analytics': ['analytics', 'list', 'select', '$.rows'],
  'apps.logs': ['runtime_logs', 'list', 'select', '$.logs'],

  // ------------------------------------------------------------ revisions
  'apps.deploy': ['revisions', 'deploy', 'insert', ''],
  'revisions.list': ['revisions', 'list', 'select', ''],
  'revisions.get': ['revisions', 'get', 'select', ''],
  'revisions.update': ['revisions', 'update', 'update', ''],
  'revisions.delete': ['revisions', 'delete', 'delete', ''],
  'revisions.cancel': ['revisions', 'cancel', 'exec', ''],
  'revisions.promote': ['revisions', 'promote', 'exec', ''],
  'revisions.attachDomain': ['revisions', 'attach_domains', 'exec', ''],
  'revisions.detachDomain': ['revisions', 'detach_domain', 'exec', ''],
  'revisions.progress': ['build_progress', 'list', 'select', '$.entries'],
  'revisions.build_logs': ['build_logs', 'list', 'select', '$.entries'],
  'revisions.timelines': ['timelines', 'list', 'select', ''],

  // --------------------------------------------------------------- layers
  'layers.list': ['layers', 'list', 'select', ''],
  'layers.get': ['layers', 'get', 'select', ''],
  'layers.create': ['layers', 'create', 'insert', ''],
  'layers.update': ['layers', 'update', 'update', ''],
  'layers.delete': ['layers', 'delete', 'delete', ''],
  'layers.apps': ['layer_apps', 'list', 'select', ''],

  // -------------------------------------------------------------- domains
  'domains.list': ['domains', 'list', 'select', ''],
  'domains.get': ['domains', 'get', 'select', ''],
  'domains.create': ['domains', 'create', 'insert', ''],
  'domains.delete': ['domains', 'delete', 'delete', ''],
  'domains.verify': ['domains', 'verify', 'exec', ''],
  'domains.uploadCertificate': ['certificates', 'upload', 'insert', ''],
  'domains.listCertificates': ['certificates', 'list', 'select', '$.certificates'],
  'domains.provisionCertificate': ['certificates', 'provision', 'exec', ''],

  // ------------------------------------------------------------ databases
  'databases.createInstance': ['database_instances', 'create', 'insert', ''],
};

// Minimal CSV record parser that respects double-quoted fields (the
// op_description values contain commas and embedded newlines, so records
// are parsed from the whole text rather than line by line).
function parseRecords(text) {
  const records = [];
  let row = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') q = false;
      else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { row.push(cur); cur = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cur); cur = '';
      if (row.length > 1 || row[0] !== '') records.push(row);
      row = [];
    } else cur += ch;
  }
  if (cur !== '' || row.length) { row.push(cur); records.push(row); }
  return records;
}
function fmt(v) {
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

const text = readFileSync(csvPath, 'utf8');
const records = parseRecords(text);
const header = records[0].map(fmt).join(',');
const out = [header];
let applied = 0;
const stillUnmapped = [];
const pruned = [];
const resynced = [];
const driftFromTable = [];
for (const c of records.slice(1)) {
  const opId = c[2];
  const live = liveOps.get(opId);
  if (!live) {
    pruned.push(opId);
    continue;
  }
  if (c[0] !== live.filename || c[1] !== live.path || c[4] !== live.verb) {
    resynced.push(`${opId}: ${c[0]} ${c[4].toUpperCase()} ${c[1]} -> ${live.filename} ${live.verb.toUpperCase()} ${live.path}`);
    c[0] = live.filename; c[1] = live.path; c[4] = live.verb;
  }
  const m = M[opId];
  // analyze prefills stackql_method_name with the formatted operationId and
  // stackql_verb from the HTTP verb, so "unmapped" is an empty resource name.
  if (c[8] !== 'skip_this_resource' && (!c[8] || !c[9] || !c[10])) {
    if (m) {
      [c[8], c[9], c[10], c[11]] = m;
      applied++;
    } else {
      stillUnmapped.push(opId);
    }
  } else if (m && (c[8] !== m[0] || c[9] !== m[1] || c[10] !== m[2] || (c[11] || '') !== m[3])) {
    driftFromTable.push(`${opId}: csv=${c[8]}.${c[9]}/${c[10]}/${c[11] || '-'} table=${m[0]}.${m[1]}/${m[2]}/${m[3] || '-'}`);
  }
  out.push(c.map(fmt).join(','));
}
writeFileSync(csvPath, out.join('\n') + '\n');
const unused = Object.keys(M).filter((k) => !liveOps.has(k));
console.log(JSON.stringify({ applied, pruned, resynced, driftFromTable, stillUnmapped, unusedMappings: unused }, null, 2));
if (stillUnmapped.length) process.exit(1);
