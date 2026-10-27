# mms-reporting-library

Starter Package for nswow development

## Installation

> npx @simple-reporting/base@latest init {{ project-name }}

### After installation

> cd {{ project-name }}

> npm install

## Usage

Run dev server:

> npm run dev

Build all required files.

> npm run build

## Important CLI commands

| Command                     | Description                                                                    |
|-----------------------------|--------------------------------------------------------------------------------|
| `npm install`               | Installs all packages listed in `package.json`                                 |
| `npm run dev`               | Starts the development environment including SCSS and JS watcher (Live Reload) |
| `npm run build`             | Generates all CSS and JS files and ZIP packages in `.output`                   |
| `npm run build-app`         | Generates the ZIP package for the web application in `.output`                 |
| `npm run build-ldd`         | Generates the ZIP package for the editor in `.output`                          |
| `npm run build-pdf`         | Generates the pdf CSS and JS in `.output`                                      |
| `npm run build-word`        | Generates the word CSS in `.output`                                            |
| `npm run build-xbrl`        | Generates the XBRL/XHTML CSS in `.output`                                      |
| `npx srl create component`  | Creates a component                                                            |
| `npx srl add components`    | Adds predefined components                                                     |
| `npx srl remove components` | Removes one or more components                                                 |
| `npx srl add groups`        | Adds predefined groups and their components                                    |
| `npx srl remove groups`     | Removes one or more groups                                                     |


## Shared editor styles

Shared editor styles live in the `scss/editor/` module. The entry point
`scss/editor-core-styles.scss` loads the project configuration and placeholders
and includes the module's `core-styles` mixin.

The module follows the same structure as the other SCSS modules:

- `index.scss` forwards variables, functions and mixins.
- `variables.scss` defines configurable color tokens, spacing and label typography.
- `functions.scss` resolves editor color roles to project colors.
- `mixins.scss` provides separate mixins for component highlights, temporary
  highlights, nowrap markers, key figures, facts, headings, placeholders and helper
  components; `core-styles` includes all of them.
- `root.scss` is reserved for editor root styles; currently existing project tokens
  provide all required values.

The generated `srl` module exposes these helpers with the `editor-` prefix,
for example `srl.editor-color('highlight')`. Importing the module alone emits no
editor rules; the entry point handles the automatic inclusion below.

`mapScss()` automatically includes them in the Livingdocs (`ldd`) stylesheet,
after the project's `general.scss` and before its `ldd.scss`, `editor.scss` and
component styles. They are not included in app, PDF, Word or XBRL stylesheets.
The shared styles use the project's SRL colors, typography and placeholders.

Keep project-specific editor styles in `src/assets/scss/editor.scss`. These load
after the shared editor styles and can override them at equal specificity.
The project-specific `@use 'web';` import remains in that local file.

When upgrading an existing project, remove duplicated shared rules from its
local `editor.scss`, retaining intentional customizations and its imports. No
manual import of the shared stylesheet is needed. Future shared changes arrive
with package updates; rebuild and deploy the Livingdocs design to apply them.

Inline editor markers share `editor.inline-marker($accent, $background, $icon: null)`:
colored backgrounds with padding and no border for key figures, facts and
temporary highlights. Key figures and facts have icons. Font Awesome Pro uses
`key-skeleton`, with `key` as the Free fallback. Nowrap uses corner markers
without a colored fill or icon. Highlight only applies the project's primary
text color.
Facts use `span.srl-fact`; enabling them in the toolbar is configured separately.
Remove corresponding local demo/project marker styles when adopting these
shared styles so they do not override future package updates.
