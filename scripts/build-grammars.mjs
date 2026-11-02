#!/usr/bin/env node
// Builds syntaxes/*.tmLanguage.json from the upstream grammars in vendor/.
//
// Orca resolves an include of another scope only against grammars in the same plugin, and it
// drops a grammar's `injections`. Upstream Liquid relies on injections to highlight `{{ }}` and
// `{% %}` inside HTML strings, <script> and <style>, so instead the Liquid injection rule is
// written into the front of every begin/end rule of the bundled HTML, CSS and JavaScript grammars.
// Liquid renders before the browser parses any of those, so it is valid in all of them.
// JSON is left alone: `{% schema %}` bodies are never rendered as Liquid.

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const LIQUID_INJECTION = { include: 'text.html.liquid#injection' }
const KEPT_KEYS = ['scopeName', 'patterns', 'repository']

function read(path) {
  return JSON.parse(readFileSync(join(root, path), 'utf8'))
}

function write(path, grammar) {
  writeFileSync(join(root, path), `${JSON.stringify(grammar, null, 2)}\n`)
}

function keep(grammar) {
  return Object.fromEntries(KEPT_KEYS.filter((key) => key in grammar).map((key) => [key, grammar[key]]))
}

function injectLiquid(rule) {
  if (!rule || typeof rule !== 'object') {
    return
  }
  if (rule.begin || rule.isRoot) {
    rule.patterns = [{ ...LIQUID_INJECTION }, ...(rule.patterns ?? [])]
  }
  for (const child of rule.patterns ?? []) {
    injectLiquid(child)
  }
  for (const child of Object.values(rule.repository ?? {})) {
    injectLiquid(child)
  }
}

function withLiquid(grammar) {
  const kept = keep(grammar)
  const rootRule = { isRoot: true, patterns: kept.patterns, repository: kept.repository }
  injectLiquid(rootRule)
  return { ...kept, patterns: rootRule.patterns }
}

function wrapper(scopeName, hostScope) {
  return { scopeName, patterns: [{ ...LIQUID_INJECTION }, { include: hostScope }], repository: {} }
}

write('syntaxes/liquid.tmLanguage.json', keep(read('vendor/shopify-liquid-tm-grammar/liquid.tmLanguage.json')))
write('syntaxes/html.tmLanguage.json', withLiquid(read('vendor/vscode/html.tmLanguage.json')))
write('syntaxes/css.tmLanguage.json', withLiquid(read('vendor/vscode/css.tmLanguage.json')))
write('syntaxes/javascript.tmLanguage.json', withLiquid(read('vendor/vscode/javascript.tmLanguage.json')))
write('syntaxes/json.tmLanguage.json', keep(read('vendor/vscode/json.tmLanguage.json')))
write('syntaxes/javascript-liquid.tmLanguage.json', wrapper('source.js.liquid', 'source.js'))
write('syntaxes/css-liquid.tmLanguage.json', wrapper('source.css.liquid', 'source.css'))
