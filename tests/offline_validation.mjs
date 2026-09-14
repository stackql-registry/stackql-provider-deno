#!/usr/bin/env node

// Quick offline validation of the generated provider against the local file
// registry - no network, no server, no credentials. Runs SHOW SERVICES /
// SHOW RESOURCES / SHOW METHODS and DESCRIBE EXTENDED over every resource and
// asserts the service split, the verb mapping conventions, the columns of
// the transformed resources (JSON Lines streams, analytics pivot) and the
// spec-level config (bearer auth, Link-header pagination, the runtime-logs
// cursor override, naive request-body translation). Exit 1 on any failure.
//
// Usage: node tests/offline_validation.mjs
// Binary resolution: $STACKQL_BIN, $STACKQL, ./stackql(.exe), then PATH.

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const regPath = path.join(repoRoot, 'provider-dev', 'openapi').replace(/\\/g, '/');
const registry = JSON.stringify({ url: `file://${regPath}`, localDocRoot: regPath, verifyConfig: { nopVerify: true } });
const providerDir = path.join(repoRoot, 'provider-dev', 'openapi', 'src', 'deno', 'v00.00.00000');
const servicesDir = path.join(providerDir, 'services');

function findBinary() {
  for (const v of ['STACKQL_BIN', 'STACKQL']) {
    if (process.env[v] && fs.existsSync(process.env[v])) return process.env[v];
  }
  for (const name of ['stackql', 'stackql.exe']) {
    const local = path.join(repoRoot, name);
    if (fs.existsSync(local)) return local;
  }
  return 'stackql'; // PATH
}
const bin = findBinary();

function runSql(sql) {
  return new Promise((resolve) => {
    const child = spawn(bin, [`--registry=${registry}`, 'exec', sql, '--output', 'json'], { cwd: repoRoot, env: process.env });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    child.on('close', (code) => {
      let rows = [];
      try { rows = JSON.parse(stdout) ?? []; } catch { rows = []; }
      resolve({ code, rows, stdout, stderr });
    });
    child.on('error', (err) => resolve({ code: -1, rows: [], stdout: '', stderr: String(err) }));
  });
}

const results = [];
function check(name, cond, note = '') {
  results.push({ name, pass: !!cond, note });
  console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${name}${cond ? '' : `  [${String(note).slice(0, 300)}]`}`);
}

const EXPECTED = {
  apps: ['apps', 'analytics', 'runtime_logs'],
  revisions: ['revisions', 'build_logs', 'build_progress', 'timelines'],
  layers: ['layers', 'layer_apps'],
  domains: ['domains', 'certificates'],
  databases: ['database_instances'],
};

console.log(`stackql: ${bin}`);
let r = await runSql('SHOW SERVICES IN deno');
const svcNames = r.rows.map((x) => x.name).sort();
check(`SHOW SERVICES lists ${Object.keys(EXPECTED).length} services`, JSON.stringify(svcNames) === JSON.stringify(Object.keys(EXPECTED).sort()), r.stderr || JSON.stringify(svcNames));

for (const [svc, expected] of Object.entries(EXPECTED)) {
  r = await runSql(`SHOW RESOURCES IN deno.${svc}`);
  const names = r.rows.map((x) => x.name).sort();
  check(`SHOW RESOURCES IN deno.${svc} = ${expected.join(', ')}`, JSON.stringify(names) === JSON.stringify([...expected].sort()), r.stderr || JSON.stringify(names));
}

async function methods(fqrn) {
  const res = await runSql(`SHOW METHODS IN ${fqrn}`);
  return { byName: Object.fromEntries(res.rows.map((m) => [m.MethodName, m])), raw: res };
}
function verbsMatch(byName, expected) {
  return Object.entries(expected).every(([m, v]) => byName[m]?.SQLVerb === v) && Object.keys(byName).length === Object.keys(expected).length;
}

let m = await methods('deno.apps.apps');
check('apps.apps verbs: list/get SELECT, create INSERT, update UPDATE, delete DELETE', verbsMatch(m.byName, { list: 'SELECT', get: 'SELECT', create: 'INSERT', update: 'UPDATE', delete: 'DELETE' }), m.raw.stderr || JSON.stringify(m.byName));
check('apps.apps.get requires app', String(m.byName.get?.RequiredParams || '').includes('app'), JSON.stringify(m.byName.get));

m = await methods('deno.revisions.revisions');
check('revisions.revisions verbs: list/get SELECT, deploy INSERT, update UPDATE, delete DELETE, cancel/promote/attach_domains/detach_domain EXEC',
  verbsMatch(m.byName, { list: 'SELECT', get: 'SELECT', deploy: 'INSERT', update: 'UPDATE', delete: 'DELETE', cancel: 'EXEC', promote: 'EXEC', attach_domains: 'EXEC', detach_domain: 'EXEC' }), m.raw.stderr || JSON.stringify(m.byName));
check('revisions.revisions.deploy requires app (POST /v2/apps/{app}/deploy)', String(m.byName.deploy?.RequiredParams || '').includes('app'), JSON.stringify(m.byName.deploy));

m = await methods('deno.layers.layers');
check('layers.layers verbs: list/get SELECT, create INSERT, update UPDATE, delete DELETE', verbsMatch(m.byName, { list: 'SELECT', get: 'SELECT', create: 'INSERT', update: 'UPDATE', delete: 'DELETE' }), m.raw.stderr || JSON.stringify(m.byName));

m = await methods('deno.domains.domains');
check('domains.domains verbs: list/get SELECT, create INSERT, delete DELETE, verify EXEC', verbsMatch(m.byName, { list: 'SELECT', get: 'SELECT', create: 'INSERT', delete: 'DELETE', verify: 'EXEC' }), m.raw.stderr || JSON.stringify(m.byName));

m = await methods('deno.domains.certificates');
check('domains.certificates verbs: list SELECT, upload INSERT, provision EXEC', verbsMatch(m.byName, { list: 'SELECT', upload: 'INSERT', provision: 'EXEC' }), m.raw.stderr || JSON.stringify(m.byName));

m = await methods('deno.databases.database_instances');
check('databases.database_instances: create INSERT only (upstream has no read endpoint)', verbsMatch(m.byName, { create: 'INSERT' }), m.raw.stderr || JSON.stringify(m.byName));

async function describe(fqrn) {
  const res = await runSql(`DESCRIBE EXTENDED ${fqrn}`);
  return { cols: res.rows.map((c) => c.name), raw: res };
}
const hasAll = (cols, want) => want.every((c) => cols.includes(c));

let d = await describe('deno.apps.apps');
check('DESCRIBE apps.apps: id, slug, labels, layers, env_vars, config, created_at, updated_at', hasAll(d.cols, ['id', 'slug', 'labels', 'layers', 'env_vars', 'config', 'created_at', 'updated_at']), d.raw.stderr || JSON.stringify(d.cols));
d = await describe('deno.revisions.revisions');
check('DESCRIBE revisions.revisions: id, status, failure_reason, labels, layers, env_vars, config, timelines, retention', hasAll(d.cols, ['id', 'status', 'failure_reason', 'labels', 'layers', 'env_vars', 'config', 'timelines', 'retention']), d.raw.stderr || JSON.stringify(d.cols));
d = await describe('deno.revisions.build_logs');
check('DESCRIBE revisions.build_logs (JSON Lines -> rows): timestamp, level, message, step, timeline', hasAll(d.cols, ['timestamp', 'level', 'message', 'step', 'timeline']) && !d.cols.includes('entries'), d.raw.stderr || JSON.stringify(d.cols));
d = await describe('deno.revisions.build_progress');
check('DESCRIBE revisions.build_progress (JSON Lines -> rows): queued, preparing, installing, building, deploying', hasAll(d.cols, ['queued', 'preparing', 'installing', 'building', 'deploying']), d.raw.stderr || JSON.stringify(d.cols));
d = await describe('deno.revisions.timelines');
check('DESCRIBE revisions.timelines: slug, partition, domains', hasAll(d.cols, ['slug', 'partition', 'domains']), d.raw.stderr || JSON.stringify(d.cols));
d = await describe('deno.apps.analytics');
check('DESCRIBE apps.analytics (pivot): time, request_count, cpu_seconds, runtime_seconds, memory_time_byte_seconds, network_ingress_bytes, network_egress_bytes, kv_read_units, kv_write_units',
  hasAll(d.cols, ['time', 'request_count', 'cpu_seconds', 'runtime_seconds', 'memory_time_byte_seconds', 'network_ingress_bytes', 'network_egress_bytes', 'kv_read_units', 'kv_write_units']) && !d.cols.includes('values'), d.raw.stderr || JSON.stringify(d.cols));
d = await describe('deno.apps.runtime_logs');
check('DESCRIBE apps.runtime_logs ($.logs): timestamp, level, message, revision_id, region', hasAll(d.cols, ['timestamp', 'level', 'message', 'revision_id', 'region']), d.raw.stderr || JSON.stringify(d.cols));
d = await describe('deno.layers.layers');
check('DESCRIBE layers.layers: id, slug, layers, env_vars, app_count', hasAll(d.cols, ['id', 'slug', 'layers', 'env_vars', 'app_count']), d.raw.stderr || JSON.stringify(d.cols));
d = await describe('deno.domains.domains');
check('DESCRIBE domains.domains: id, domain, kind, verification_token, is_validated, dns_records, provisioning_status, certificates', hasAll(d.cols, ['id', 'domain', 'kind', 'verification_token', 'is_validated', 'dns_records', 'provisioning_status', 'certificates']), d.raw.stderr || JSON.stringify(d.cols));
d = await describe('deno.domains.certificates');
check('DESCRIBE domains.certificates ($.certificates): id, kind, subject_alt_names, not_valid_after', hasAll(d.cols, ['id', 'kind', 'subject_alt_names', 'not_valid_after']), d.raw.stderr || JSON.stringify(d.cols));

// spec-level assertions on the generated documents
const provider = yaml.load(fs.readFileSync(path.join(providerDir, 'provider.yaml'), 'utf8'));
check('provider.yaml: bearer auth from DENO_DEPLOY_TOKEN', provider.config?.auth?.type === 'bearer' && provider.config?.auth?.credentialsenvvar === 'DENO_DEPLOY_TOKEN', JSON.stringify(provider.config));
check('provider.yaml lists the 5 services', JSON.stringify(Object.keys(provider.providerServices || {}).sort()) === JSON.stringify(Object.keys(EXPECTED).sort()), JSON.stringify(Object.keys(provider.providerServices || {})));

let bodyMethods = 0, naive = 0, markers = 0, transforms = 0, cursor = 0;
for (const f of fs.readdirSync(servicesDir).filter((x) => x.endsWith('.yaml'))) {
  const doc = yaml.load(fs.readFileSync(path.join(servicesDir, f), 'utf8'));
  check(`${f}: document server is https://api.deno.com`, doc.servers?.[0]?.url === 'https://api.deno.com', JSON.stringify(doc.servers));
  const pag = doc['x-stackQL-config']?.pagination;
  check(`${f}: Link-header pagination config`, pag?.responseToken?.key === 'Link' && pag?.responseToken?.location === 'header' && pag?.requestToken?.location === 'request', JSON.stringify(doc['x-stackQL-config']));
  for (const res of Object.values(doc.components?.['x-stackQL-resources'] || {})) {
    for (const meth of Object.values(res.methods || {})) {
      const ref = meth.operation?.$ref || '';
      const verb = ref.split('/').pop();
      const pathKey = ref.slice('#/paths/'.length, ref.lastIndexOf('/')).replace(/~1/g, '/');
      const op = doc.paths?.[pathKey]?.[verb];
      if (op?.requestBody && ['post', 'put', 'patch'].includes(verb)) {
        bodyMethods++;
        if (meth.config?.requestBodyTranslate?.algorithm === 'naive') naive++;
      }
      if (meth.response?.transform) transforms++;
      if (meth.config?.pagination?.requestToken?.key === 'cursor' && meth.config?.pagination?.responseToken?.key === '$.next_cursor') cursor++;
    }
  }
  for (const item of Object.values(doc.paths || {})) {
    for (const op of Object.values(item)) if (op && typeof op === 'object') for (const k of Object.keys(op)) if (k.startsWith('x-stackql-')) markers++;
  }
}
check(`requestBodyTranslate: naive on every POST/PUT/PATCH method with a body (${naive}/${bodyMethods})`, bodyMethods === 10 && naive === bodyMethods, `${naive}/${bodyMethods}`);
check(`response transforms on build_logs, build_progress and analytics (${transforms} == 3)`, transforms === 3, String(transforms));
check(`cursor pagination override on runtime_logs.list (${cursor} == 1)`, cursor === 1, String(cursor));
check('no x-stackql-* build markers left in the published specs', markers === 0, String(markers));

const failed = results.filter((x) => !x.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length) process.exit(1);
