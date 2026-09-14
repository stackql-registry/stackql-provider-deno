#!/usr/bin/env node
// post_process.mjs
//
// Applies the handful of adjustments the generator cannot express to the
// generated provider under provider-dev/openapi/src/deno/<version>/.
// Every rule is data in the tables below; the script is idempotent (re-runs
// on an already-processed tree are no-ops) and fails loudly, writing
// nothing, if a rule targets a method that no longer exists.
//
// Why these exist (see NOTES.md for the evidence):
//
//   1. JSON Lines streams. GET /v2/revisions/{revision}/build_logs and
//      /progress only speak Server-Sent Events or JSON Lines
//      (`application/x-ndjson`). The method binds the JSONL media type (so
//      stackql sends `Accept: application/x-ndjson`), and a text transform
//      turns the newline-delimited objects into a JSON envelope
//      `{"entries": [...]}` that the row projector reads through
//      `objectKey: $.entries`. The wrapper schema is synthesised here so
//      DESCRIBE lists the entry columns.
//
//   2. Analytics pivot. GET /v2/apps/{app}/analytics returns a table
//      envelope `{fields: [{name, type}], values: [[...]]}`. A `values`
//      column cannot be selected by name (the SQL parser rejects the
//      keyword even quoted) and column-per-metric is what a user wants
//      anyway, so a JSON transform pivots each row of `values` into an
//      object keyed by `fields[].name`, under `{"rows": [...]}`.
//
//   3. Runtime logs cursor pagination. GET /v2/apps/{app}/logs pages with a
//      `cursor` query parameter and a `next_cursor` field in the body (no
//      Link header), so the method overrides the service-level Link-header
//      pagination config that every other list inherits.
//
//   4. Validation: every service document carries the Link-header
//      pagination config and the api.deno.com server, and no build markers
//      are left behind.
//
// Usage: node provider-dev/scripts/post_process.mjs [--provider-dir provider-dev/openapi/src/deno/v00.00.00000] [--verbose]

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import yaml from 'js-yaml';

function getArg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  if (i === -1) return fallback;
  return process.argv[i + 1] ?? fallback;
}
const providerDir = resolve(getArg('--provider-dir', 'provider-dev/openapi/src/deno/v00.00.00000'));
const servicesDir = join(providerDir, 'services');
const verbose = process.argv.includes('--verbose');

const API_BASE_URL = 'https://api.deno.com';
const JSONL_MEDIA_TYPE = 'application/x-ndjson';

// `.` is the raw response text for golang_template_text_*; every non-empty
// line of a JSON Lines body is one JSON object. The template engine has no
// string-split function (getRegexpAllMatches returns the capture groups of
// the FIRST match only), so the body is walked line by line with a cursor:
// `getRegexpFirstMatch $rest "^([^\n]*)"` reads the current line, `slice` /
// `plus1` / `len` advance past it, and a seed regex of JSONL_MAX_LINES empty
// capture groups matched against "" supplies the loop bound (text/template
// cannot count). Each step is O(line), so the walk is linear in the body;
// bodies longer than JSONL_MAX_LINES lines are truncated to the first
// JSONL_MAX_LINES rows. A template error is swallowed by the engine (the
// reader returns io.EOF with the payload), surfacing downstream as
// "unexpected EOF" - keep this template free of failing calls.
const JSONL_MAX_LINES = 5000;
const JSONL_TEMPLATE = [
  '{{- $rest := . -}}{{- $sep := "" -}}{"entries":[',
  `{{- range $i, $_ := getRegexpAllMatches "" "${'()'.repeat(JSONL_MAX_LINES)}" -}}`,
  '{{- if $rest -}}',
  '{{- $line := getRegexpFirstMatch $rest "^([^\\n]*)" -}}',
  '{{- if gt (len $rest) (len $line) }}{{ $rest = slice $rest (plus1 (len $line)) }}{{ else }}{{ $rest = "" }}{{ end -}}',
  '{{- if $line }}{{ $sep }}{{ $line }}{{ $sep = "," }}{{ end -}}',
  '{{- end -}}',
  '{{- end -}}]}',
].join('');

// `.` is the parsed body for golang_template_json_*; `$` is the root, so
// `(index $.fields $ci).name` is the column name for position $ci.
const ANALYTICS_TEMPLATE = '{"rows":[{{ range $ri, $row := .values }}{{ if $ri }},{{ end }}{{ "{" }}{{ range $ci, $v := $row }}{{ if $ci }},{{ end }}{{ toJson (index $.fields $ci).name }}:{{ toJson $v }}{{ end }}{{ "}" }}{{ end }}]}';

// The Phase 1 field set documented on the operation; the transform emits
// whatever the API returns, so a new field appears once it is added here.
const ANALYTICS_FIELDS = {
  time: { type: 'string', format: 'date-time', description: 'Start of the fixed 15-minute UTC bucket' },
  request_count: { type: 'number', description: 'Requests served in the bucket' },
  cpu_seconds: { type: 'number', description: 'CPU time consumed, in seconds' },
  runtime_seconds: { type: 'number', description: 'Wall-clock runtime, in seconds' },
  memory_time_byte_seconds: { type: 'number', description: 'Memory usage integrated over time, in byte-seconds' },
  network_ingress_bytes: { type: 'number', description: 'Bytes received' },
  network_egress_bytes: { type: 'number', description: 'Bytes sent' },
  kv_read_units: { type: 'number', description: 'Deno KV read units' },
  kv_write_units: { type: 'number', description: 'Deno KV write units' },
};

// ---------------------------------------------------------------------------
// 1. JSONL streams: service -> resource -> method -> item schema ref
// ---------------------------------------------------------------------------
const JSONL_RULES = {
  revisions: {
    build_logs: { list: { items: '#/components/schemas/BuildLogEntry', wrapper: 'stackqlBuildLogEntries' } },
    build_progress: { list: { items: '#/components/schemas/RevisionProgress', wrapper: 'stackqlBuildProgressEntries' } },
  },
};

// ---------------------------------------------------------------------------
// 2. analytics pivot
// ---------------------------------------------------------------------------
const ANALYTICS_RULES = {
  apps: { analytics: { list: { wrapper: 'stackqlAnalyticsRows' } } },
};

// ---------------------------------------------------------------------------
// 3. cursor pagination overrides
// ---------------------------------------------------------------------------
const CURSOR_RULES = {
  apps: {
    runtime_logs: {
      list: {
        requestToken: { key: 'cursor', location: 'query' },
        responseToken: { key: '$.next_cursor', location: 'body' },
      },
    },
  },
};

// ---------------------------------------------------------------------------

let requestedChanges = 0;
const problems = [];
const docs = new Map();

function loadService(service) {
  if (docs.has(service)) return docs.get(service);
  const file = join(servicesDir, `${service}.yaml`);
  if (!existsSync(file)) {
    problems.push(`service file not found: ${file}`);
    return null;
  }
  const entry = { file, doc: yaml.load(readFileSync(file, 'utf8')), before: null };
  entry.before = JSON.stringify(entry.doc);
  docs.set(service, entry);
  return entry;
}

function getMethod(doc, service, resource, method) {
  const res = doc?.components?.['x-stackQL-resources']?.[resource];
  if (!res) { problems.push(`${service}: resource ${resource} not found`); return null; }
  const m = res.methods?.[method];
  if (!m) { problems.push(`${service}: method ${resource}.${method} not found`); return null; }
  return m;
}

function setResponse(m, response) {
  if (JSON.stringify(m.response) !== JSON.stringify(response)) {
    m.response = response;
    requestedChanges++;
    return true;
  }
  return false;
}

// 1. JSONL streams
for (const [service, resources] of Object.entries(JSONL_RULES)) {
  const entry = loadService(service);
  if (!entry) continue;
  const { doc } = entry;
  doc.components.schemas = doc.components.schemas || {};
  for (const [resource, methods] of Object.entries(resources)) {
    for (const [method, rule] of Object.entries(methods)) {
      const m = getMethod(doc, service, resource, method);
      if (!m) continue;
      const itemName = rule.items.split('/').pop();
      if (!doc.components.schemas[itemName]) { problems.push(`${service}: schema ${itemName} not found for ${resource}.${method}`); continue; }
      doc.components.schemas[rule.wrapper] = {
        type: 'object',
        properties: { entries: { type: 'array', items: { $ref: rule.items } } },
      };
      const changed = setResponse(m, {
        mediaType: JSONL_MEDIA_TYPE,
        openAPIDocKey: m.response?.openAPIDocKey || '200',
        objectKey: '$.entries',
        overrideMediaType: 'application/json',
        schema_override: { $ref: `#/components/schemas/${rule.wrapper}` },
        transform: { type: 'golang_template_text_v0.3.0', body: JSONL_TEMPLATE },
      });
      if (verbose && changed) console.log(`jsonl stream ${service}.${resource}.${method} -> ${rule.wrapper}`);
    }
  }
}

// 2. analytics pivot
for (const [service, resources] of Object.entries(ANALYTICS_RULES)) {
  const entry = loadService(service);
  if (!entry) continue;
  const { doc } = entry;
  doc.components.schemas = doc.components.schemas || {};
  for (const [resource, methods] of Object.entries(resources)) {
    for (const [method, rule] of Object.entries(methods)) {
      const m = getMethod(doc, service, resource, method);
      if (!m) continue;
      doc.components.schemas[rule.wrapper] = {
        type: 'object',
        properties: {
          rows: {
            type: 'array',
            description: 'One row per 15-minute bucket; columns are the analytics fields reported by the API',
            items: { type: 'object', properties: ANALYTICS_FIELDS },
          },
        },
      };
      const changed = setResponse(m, {
        mediaType: 'application/json',
        openAPIDocKey: m.response?.openAPIDocKey || '200',
        objectKey: '$.rows',
        overrideMediaType: 'application/json',
        schema_override: { $ref: `#/components/schemas/${rule.wrapper}` },
        transform: { type: 'golang_template_json_v0.3.0', body: ANALYTICS_TEMPLATE },
      });
      if (verbose && changed) console.log(`analytics pivot ${service}.${resource}.${method} -> ${rule.wrapper}`);
    }
  }
}

// 3. cursor pagination overrides
for (const [service, resources] of Object.entries(CURSOR_RULES)) {
  const entry = loadService(service);
  if (!entry) continue;
  for (const [resource, methods] of Object.entries(resources)) {
    for (const [method, pagination] of Object.entries(methods)) {
      const m = getMethod(entry.doc, service, resource, method);
      if (!m) continue;
      const config = { ...(m.config || {}), pagination };
      if (JSON.stringify(m.config) !== JSON.stringify(config)) {
        m.config = config;
        requestedChanges++;
        if (verbose) console.log(`cursor pagination ${service}.${resource}.${method}`);
      }
    }
  }
}

// 4. validation over every service
for (const f of readdirSync(servicesDir).filter((x) => x.endsWith('.yaml')).sort()) {
  const service = f.replace(/\.yaml$/, '');
  const entry = loadService(service);
  if (!entry) continue;
  const { doc } = entry;
  if (doc.servers?.[0]?.url !== API_BASE_URL) problems.push(`${f}: document server is ${doc.servers?.[0]?.url}, expected ${API_BASE_URL}`);
  const pag = doc['x-stackQL-config']?.pagination;
  if (pag?.responseToken?.key !== 'Link' || pag?.responseToken?.location !== 'header') problems.push(`${f}: missing the Link-header pagination config (x-stackQL-config.pagination)`);
  const resources = doc.components?.['x-stackQL-resources'] || {};
  if (Object.keys(resources).length === 0) problems.push(`${f}: no x-stackQL-resources`);
  for (const [p, item] of Object.entries(doc.paths || {})) {
    if (!p.startsWith('/v2/')) problems.push(`${f}: path ${p} is not under /v2/`);
    for (const op of Object.values(item)) {
      if (!op || typeof op !== 'object') continue;
      for (const k of Object.keys(op)) if (k.startsWith('x-stackql-')) problems.push(`${f}: build marker ${k} left on ${p}`);
    }
  }
}

if (problems.length) {
  console.error(`post_process FAILED with ${problems.length} problem(s), nothing written:`);
  for (const x of problems) console.error(`  ${x}`);
  process.exit(1);
}
let changedFiles = 0;
for (const [, entry] of docs) {
  if (JSON.stringify(entry.doc) !== entry.before) {
    writeFileSync(entry.file, yaml.dump(entry.doc, { lineWidth: -1, noRefs: true }));
    changedFiles++;
  }
}
console.log(JSON.stringify({ providerDir, servicesChecked: docs.size, changedFiles, changes: requestedChanges }, null, 2));
