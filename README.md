# Liquid Syntax

Shopify Liquid highlighting for Orca's editor:

- `.liquid` files: Liquid tags, objects, filters and comments over HTML, with Liquid also
  highlighted inside HTML attribute strings, `<script>` and `<style>`.
- `{% stylesheet %}` / `{% style %}` as CSS, `{% javascript %}` as JavaScript and `{% schema %}`
  as JSON.
- `.js.liquid` and `.css.liquid` files: JavaScript or CSS with Liquid inside.
- Bracket matching and auto-closing for `{% %}` and `{{ }}`, and comment toggling with
  `{% # … %}`.

## How it is built

Orca resolves an embedded scope (`text.html.basic`, `source.css`, …) only against grammars in the
same plugin, and ignores a grammar's `injections`. So this plugin bundles its own HTML, CSS,
JavaScript and JSON grammars as extra syntaxes with no file extensions. `scripts/build-grammars.mjs`
copies them from `vendor/` and writes Liquid's injection rule into every HTML, CSS and JavaScript
scope, which takes the place of the upstream grammar's injections.

Edit `vendor/` or the script, never `syntaxes/*.tmLanguage.json`, then rebuild:

```sh
node scripts/build-grammars.mjs
orca plugin validate .
```

## Develop

```sh
orca plugin dev load .     # adds this folder under Settings → Plugins → Development folders
orca plugin dev watch .    # or: load, print logs and reloads; Ctrl-C unloads it
```

Open `test/fixtures/embedded.liquid` and `test/fixtures/showcase.liquid` to check the result.

## Limitations

- Toggling a comment over several lines wraps them in one `{% # … %}`, which Liquid only accepts
  when every line starts with `#`. Orca limits comment markers to 8 characters, so
  `{% comment %}` cannot be used.
- Orca colors TextMate scopes through a fixed map, so the `{{ }}` / `{% %}` delimiters
  (`punctuation.*`) stay in the default text color.
- Highlighting only: completions, hover and Theme Check diagnostics need a language server,
  which Orca plugins cannot attach to the editor today.

## Third-party grammars

- `vendor/shopify-liquid-tm-grammar/`: [Shopify/liquid-tm-grammar](https://github.com/Shopify/liquid-tm-grammar)
  at `98f8732e2ace9e3312898ad047532e9e3dff993a`, MIT, see its `LICENSE.md`. `test/fixtures/showcase.liquid`
  is from the same repository.
- `vendor/vscode/`: HTML, CSS, JavaScript and JSON grammars from
  [microsoft/vscode](https://github.com/microsoft/vscode) `extensions/` at
  `d041bd1a3183ba62a0fafb880d2bce0ec3aa3b99`, MIT, see `vendor/vscode/LICENSE.txt`.
