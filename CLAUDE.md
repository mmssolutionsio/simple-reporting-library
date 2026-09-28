# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

The Simple Reporting Library (SRL): the npm package `@simple-reporting/base` that ships the `srl` CLI (`cli.js`), a Vite plugin, shared SCSS, and a library of Livingdocs components. It is **not** an app itself — it scaffolds and builds consumer report projects (Vue 3 + Vite + Livingdocs) that produce web app, Livingdocs editor design (ldd), PDF (PDFreactor), Word and XBRL/XHTML outputs.

**nswow** is the separate software that delivers the content (hosts the Livingdocs designs, renders PDFs); identifiers such as the `nswow-table`/`nswow-pdf` services, `.env.nswow` and `nsWowInternalLddUrl` refer to it and are correct.

ES modules throughout (`"type": "module"`), Node >= 22.12.

## Commands (this repo)

- `npm run lint` / `npm run lint:fix` — Prettier check / write
- `npm test` — Jest with `--experimental-vm-modules` (config in `jest.config.mjs`)
- Single test: `npm test -- <path-or-pattern>` or `npm test -- -t "<test name>"`

There is no build step for the package itself. To exercise changes, use a consumer project (gitignored scratch dirs `test-project/`, `test-data/` are conventional here) that depends on this package, e.g. via `npx srl init <folder>` from this repo or `npm link`.

Git workflow: branch from `main` as `feature/*`, commit there, and only push the branch when the work is done (never push without being asked). Do **not** create pull requests — merging and releasing are done manually by the maintainers.

Releases: creating a GitHub release triggers `.github/workflows/npm-publish.yml`, which runs `scripts/doPublish.js -v <tag>`. `preparePublish.js` writes the version into `package.json` and the `dev/package.json` dependency, regenerates `scripts/**/*.d.ts` via the TypeScript compiler, then `npm publish` runs. Release tags must be plain `X.Y.Z` (no `v` prefix).

## Commands (consumer project, from README / `dev/package.json`)

- `npm run dev` — Vite dev server with live remapping
- `npm run build` → `srl build [version] [-t app,pdf,word,xbrl,ldd] [-c <customer>|all]`; outputs to `.output/` (`app.zip`, `design.zip`, `pdf/`, `word/`, `xbrl/`)
- `npx srl create component|group`, `srl add components|groups`, `srl remove components|groups`
- `postinstall` runs `srl prepare`

## Architecture

**Key paths are resolved relative to `process.cwd()` (the consumer project), not this repo** — see `scripts/folders.js`. Scripts assume they run inside a consumer project whose `node_modules/@simple-reporting/base` is this package.

- `dev/` — the project skeleton copied by `srl init` (`scripts/init.js`), plus the base components listed in `scripts/config.js` (`baseComponentsToInstall`), which are copied from this repo's `livingdocs/`.
- `srl/` — copied into the consumer root by `srl prepare` (`scripts/prepare.js`); becomes the consumer's `srl/` folder (auto-gitignored there). Resolved via the `srl` alias.
- `livingdocs/` — component library. Layout: `<NNN.Group>/<NNN.component-name>/` containing `ld-conf.json` + `*.html` (the Livingdocs component), optional `*.vue` (registered as async `SrlLd<Name>`), `app.ts|js` (runtime class autoloaded by folder name), `scss/{general,app,ldd,editor,pdf,word,xbrl}.scss`, and `properties.{json,js,ts}`. Numeric prefixes control ordering and are stripped from names. `999.Properties/` holds shared component properties.
- `scss/` — core SCSS consumed as `@simple-reporting/base/scss/...` (`init-root.scss`, `core-styles.scss`, `xbrl-core-styles.scss`, typography, colors, …).
- `plugins/viteSrlPlugin.js` — the heart of dev mode. Sets aliases (`#srl`, `#ld`, `#components`, `#imports`, `srl`, `assets`, `fa-source`/`fa-font` free vs pro, …), and on `configResolved` runs the generation pipeline; file watchers re-run the relevant mapper (debounced) when scss/app.ts/properties/vue files are added or removed or when `srl.config.json` changes.

### Code generation pipeline (all writes into the consumer's `.srl/`, `srl/`, `src/`)

- `beaver` (`scripts/beaver.js`) — turns `srl.config.json` design tokens (typography, colors, spacer, grid, meta) into generated SCSS modules under `srl/`.
- `mapScss` (`scripts/build.js`) — scans `src/assets/scss/*.scss`, `src/assets/fonts/**`, and each component's `scss/<target>.scss`, and writes one entry per target to `.srl/imports/{app,ldd,pdf,word,xbrl}.scss` (`editor.scss` goes into `ldd`; `general.scss` goes into all except xbrl).
- `mapIndexScss` — writes `srl/index.scss` forwarding the system modules plus `src/assets/scss/placeholders/**`.
- `mapLdd` (`scripts/ldd/mapLdd.js`) — builds the Livingdocs design JSON (groups, components with minified HTML, componentProperties) and `.srl/plugins/asyncLdComponent.ts`.
- `mapJs` — writes `src/Autoload.ts` registering each component's `app.ts` with `ArticleAutoloader`.
- `generateUseSrlConfig`, `vueComponents` — generate composables / component registrations.

Generated files should not be hand-edited; change the mapper or the source files instead.

### Build (`scripts/build.js` → `build()`)

Each target calls Vite programmatically after setting `buildVariables.system` (`build` = app|editor|pdf|word|xbrl, `size-unit` = rem, or pt for Word) — SCSS branches on these. Order: clean `.output` → app → pdf → word → xbrl → ldd (+ fonts, `design.json`, `LivingdocsDesignValidator`) → per-customer PDF (`pdf/customers/<name>/custom.{ts,scss}`, `public/`, generates `pdf-configuration[-debug].xml` pointing at `INTERNAL_LDD_URL` or `nsWowInternalLddUrl`) → XBRL `@media` stripping → zips. The `ldd` target prompts for a version and writes it into the consumer's `package.json`.

## Related skill

The `srl-best-practice` skill covers conventions for *consumer* projects (component authoring, `srl.config.json`, `@use 'srl'`, PDFreactor scripts) — use it when changing `livingdocs/` components or `dev/` templates.
