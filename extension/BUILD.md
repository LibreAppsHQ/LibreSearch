# Build instructions (for AMO reviewers)

This add-on is written in plain HTML/CSS/JS. The only generated files are the
two compiled stylesheets, produced from their `*.src.css` sources with the
**Tailwind CSS v4 CLI**. All JavaScript is hand-written and shipped as-is (no
minifier, bundler, or transpiler).

## Generated files

| Shipped file          | Source file               |
| --------------------- | ------------------------- |
| `popup/popup.css`     | `popup/popup.src.css`     |
| `options/options.css` | `options/options.src.css` |

`themes.css` is imported by both sources via `@import '../themes.css'`.

## Environment

- Node.js 20 LTS (any recent Node works)
- Tailwind CSS v4.3.0, run via `npx` (no project install required)

## Commands

Run from the extension root (the directory containing `manifest.json`):

```sh
npx @tailwindcss/cli@4.3.0 -i popup/popup.src.css     -o popup/popup.css     --minify
npx @tailwindcss/cli@4.3.0 -i options/options.src.css -o options/options.css --minify
```

Tailwind v4 auto-detects utility classes by scanning the HTML/JS in this
directory, so no separate config file is needed. The output is the minified
single-line CSS included in the package.
