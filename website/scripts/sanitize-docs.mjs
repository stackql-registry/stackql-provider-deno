#!/usr/bin/env node
// Post-docgen sanitizer for the generated provider docs.
//
// Upstream descriptions can carry literal angle-bracket placeholders
// (<site-id>), stray unpaired HTML and braces ({...}). MDX v3 parses any raw
// <token> as JSX and fails the build on the first mismatch; braces parse as
// JSX expressions with the same failure mode.
//
// The doc generator's own structure is line-shaped: one `<td>...</td>`
// cell per line, and description text ONLY ever appears as td inner
// content. So the deterministic fix: inside every description cell,
// escape ALL angle brackets and braces (protecting the stage-1
// backtick-wrapped `<placeholder>` tokens as <code> spans); leave
// every other line - tables, Tabs/TabItem/CodeBlock, CopyableCode,
// index link lists - byte-for-byte untouched.
//
// Run after `npm run generate-docs`, before building the website.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const docsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs');

const TD_LINE = /^(\s*<td>)(.*)(<\/td>\s*)$/;
const LINK_TOKEN = '<a href="#[^"]*">(?:<CopyableCode\\b[^<>]*\\/>|<code>[^<>]*<\\/code>)<\\/a>';
const LINK_TOKEN_CELL = new RegExp(`^${LINK_TOKEN}(?:,\\s*${LINK_TOKEN})*$`);
const BACKTICKED = /`<([A-Za-z][A-Za-z0-9_.:-]*)>`/g;
// Control-char sentinels: cannot occur in generated markdown.
const OPEN = '';
const CLOSE = '';

let filesChanged = 0;
let cellsEscaped = 0;

function escapeDescription(inner) {
  let out = inner.replace(BACKTICKED, (m, name) => OPEN + name + CLOSE);
  out = out
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;')
    // Regex fragments in descriptions ("s3://([^/]+)(/.*)?") read as
    // markdown links ("[...](...)") and crash the link resolver.
    .replace(/\[/g, '&#91;')
    .replace(/\]/g, '&#93;')
    // GFM autolinks bare "scheme://..." literals on the DECODED text
    // tree (entity escapes cannot evade it) and Docusaurus crashes on
    // regex-shaped ones ("https://.+"). A zero-width space inside "://"
    // is invisible in rendering but breaks the autolink prefix match.
    .replace(/:\/\//g, ':​//');
  out = out.split(OPEN).join('<code>&lt;').split(CLOSE).join('&gt;</code>');
  return out;
}

// Inside a CodeBlock template literal, a lone backslash before u/x is a JS
// string escape (backslash-u007F evaluates to a DEL byte at build time), and ${
// starts interpolation. Double the backslash / escape the $ so the source
// text renders verbatim.
// The (?<!\\) guards skip sequences that are already escaped in the
// source (e.g. IAM session policies carry literal "\${Transfer:UserName}").
function escapeTemplateLiteral(line) {
  return line
    .replace(/(?<!\\)\\(?=[ux])/g, '\\\\')
    .replace(/(?<!\\)\$\{/g, '\\${');
}

function sanitize(text, filePath = '') {
  const lines = text.split('\n');
  let changed = false;
  let inFence = false;
  let inTabItemProse = false;
  let inCodeBlock = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed.startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    // <CodeBlock>{`...`}</CodeBlock> spans hold verbatim SQL in a JSX
    // template literal. The MDX/HTML escapes applied elsewhere must NOT
    // touch these lines, but JS still evaluates the template literal, so
    // sequences like backslash-u007F in AWS description text become raw control
    // characters in the built HTML. Neutralize JS escape starts (\u, \x)
    // and interpolation (${) so the text survives verbatim.
    if (inCodeBlock) {
      if (/<\/CodeBlock>/.test(line)) inCodeBlock = false;
      const esc = escapeTemplateLiteral(line);
      if (esc !== line) { lines[i] = esc; changed = true; }
      continue;
    }
    if (/<CodeBlock\b/.test(line)) {
      if (!/<\/CodeBlock>/.test(line)) inCodeBlock = true;
      const esc = escapeTemplateLiteral(line);
      if (esc !== line) { lines[i] = esc; changed = true; }
      continue;
    }
    if (/^<TabItem\b/.test(trimmed)) {
      inTabItemProse = true;
      continue;
    }
    if (/^<\/TabItem>/.test(trimmed)) {
      inTabItemProse = false;
      continue;
    }

    // Description table cells (one <td>...</td> per line).
    const m = TD_LINE.exec(line);
    if (m) {
      const inner = m[2];
      if (/^<CopyableCode\b[^<>]*\/>$/.test(inner)) continue;
      // Structural link cells in the Methods/Parameters tables: one or
      // more comma-separated anchor-wrapped tokens
      // (<a href="#m"><CopyableCode .../></a> or
      // <a href="#parameter-x"><code>x</code></a>). Generated structure,
      // not description text - must stay verbatim.
      if (LINK_TOKEN_CELL.test(inner)) continue;
      const codeCell = /^<code>([^<>]*)<\/code>$/.exec(inner);
      if (codeCell) {
        // Type/pattern cells: regex patterns form accidental markdown
        // links ("[...](...)" inside character classes) and MDX brace
        // expressions ({4,7} quantifiers). Neutralise both; entities
        // decode inside the <code> element so rendering is unchanged.
        const escaped = codeCell[1]
          .replace(/\[/g, '&#91;')
          .replace(/\]/g, '&#93;')
          .replace(/\{/g, '&#123;')
          .replace(/\}/g, '&#125;')
          .replace(/:\/\//g, ':​//');
        if (escaped !== codeCell[1]) {
          lines[i] = m[1] + '<code>' + escaped + '</code>' + m[3];
          cellsEscaped++;
          changed = true;
        }
        continue;
      }
      const escaped = escapeDescription(inner);
      if (escaped !== inner) {
        lines[i] = m[1] + escaped + m[3];
        cellsEscaped++;
        changed = true;
      }
      continue;
    }

    // Method-description prose inside <TabItem> blocks (the paragraphs
    // between the TabItem opener and the ```sql fence). Prose never
    // starts with '<'; anything with raw angle brackets or braces there
    // is hostile description content.
    if (inTabItemProse && trimmed && !trimmed.startsWith('<') && /[<>{}]/.test(line)) {
      const escaped = escapeDescription(line);
      if (escaped !== line) {
        lines[i] = escaped;
        cellsEscaped++;
        changed = true;
      }
    }
  }
  return { text: lines.join('\n'), changed };
}

// Deno's descriptions link to anchors on its own API reference page
// (e.g. "#tag/revisions/GET/api/v2/revisions/{revision}/progress"); resolved
// against the provider docs they are broken anchors, so point them at the
// reference.
const UPSTREAM_API_REF = 'https://api.deno.com/v2/docs';
function rewriteUpstreamAnchors(text) {
  return text.split('(#tag/').join('(' + UPSTREAM_API_REF + '#tag/').split('href="#tag/').join('href="' + UPSTREAM_API_REF + '#tag/');
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(p);
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
      const raw = fs.readFileSync(p, 'utf8');
      const before = rewriteUpstreamAnchors(raw);
      const { text: after, changed } = sanitize(before, p);
      if (changed || before !== raw) {
        fs.writeFileSync(p, after);
        filesChanged++;
      }
    }
  }
}

walk(docsDir);
console.log(`sanitize-docs: escaped ${cellsEscaped} description cell(s) across ${filesChanged} file(s)`);
