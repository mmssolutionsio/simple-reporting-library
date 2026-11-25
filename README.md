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

Placeholders own their full width and vertical padding (`$placeholder-padding`,
spacer `200` by default). `$placeholder-spacing` controls their outer margins.
The additional `srl-editor-component` class is not required for placeholder padding.

The module follows the same structure as the other SCSS modules:

- `index.scss` forwards variables, functions and mixins.
- `variables.scss` defines configurable color tokens, spacing and label typography.
- `functions.scss` resolves editor color roles and spacing to CSS variables with
  backwards-compatible fallback values.
- `mixins.scss` provides separate mixins for component highlights, temporary
  highlights, nowrap markers, key figures, facts, headings, placeholders and helper
  components; `core-styles` includes all of them.
- `root.scss` is reserved for editor root styles.

The generated `srl` module exposes these helpers with the `editor-` prefix,
for example `srl.editor-color('highlight')`. Importing the module alone emits no
editor rules; the entry point handles the automatic inclusion below.

`mapScss()` automatically includes them in the Livingdocs (`ldd`) stylesheet,
after the project's `general.scss` and before its `ldd.scss`, `editor.scss` and
component styles. They are not included in app, PDF, Word or XBRL stylesheets.
The shared styles use the project's SRL color, spacing and typography CSS
variables when available. Built-in fallback values keep the editor stylesheet
compilable for older projects that do not yet define tokens such as spacer
`1600` or `editor-label-text`. The module does not extend project placeholders;
instead it applies the SRL grid mixins directly to editor helper elements that do
not already carry `.srl-grid` or `.srl-grid__inner`, but only when the complete
current SRL breakpoint set is available. Older projects with different or missing
breakpoints receive no additional editor grid rules.

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

## PDF page rules

The PDF entry imports its normal stylesheet and passes only compiled `@page`
blocks to the page-reference color helper:

```ts
import '#imports/pdf.scss'
import pdfPageRules from '#imports/pdf.scss?srl-page-rules'
```

The SRL Vite plugin extracts these blocks after SCSS compilation. The complete
stylesheet remains in `pdf.css`; component styles, fonts and design tokens are
not duplicated in `pdf.js`.

Customer builds also extract page rules from `custom.css` and all additional
CSS files registered from the customer's `public/` directory, in stylesheet
load order. These small rule sets are prepended to the generated `custom.js`;
no customer-specific imports are needed. Deploy the updated base `pdf.js` and
rebuilt customer `custom.js` together when adopting this helper.

The PDF TOC page supports an optional `background` image with the existing `a4`
portrait crop. PDFreactor repeats the image across every page of a split TOC,
including the page margins, using page-fragment decorations. TOC content keeps
its normal layout, and surrounding pages do not receive the image.

Both PDF reference components support an optional `fallback-image` upload for
web, Word, XHTML/XBRL and translate-plus output. The PDF include is removed from
these channels; the image is removed from PDF output. Images can keep their
original ratio or use one of the configured crops, including A4.

The **PDF placement container** (`pdf-placement-container`) goes directly
inside a PDF column container and holds one image. Add both container components
to consumer designs that use this feature. **Page placement** on the wrapper
selects the top, bottom, or one of the four corners of the page.
With **In text flow**, or when the wrapper does not contain exactly one image,
the contents remain in normal flow.

| Image Width | Two columns | Three columns |
| ----------- | ----------- | ------------- |
| Regular     | 1           | 1             |
| Wide        | 2           | 2             |
| Full        | 2           | 3             |

The table applies only to actively placed images in the nested container. The
image reaches the top or bottom trim edge. At a corner, it also extends across
the selected side margin, and the caption uses the remaining columns towards
the centre. At the top or bottom, and for
full-span corners, the caption sits below a top image or above a bottom image.
The existing Width rules still apply to images outside the placement layout.

The PDF column container exposes `pdf-column-count`: two columns by default,
or three columns (`srl-pdf-columns-3`). The selected count applies only to that
container's own content, so nested containers keep their independent selection.
Balanced/unbalanced filling remains a separate option for either column count.

The PDF entry calls `PDFImageFloats` in `load`, before page-reference colors.
For a placement wrapper, it copies the source column count and gap and lifts
the wrapper into page flow by splitting the ancestor shells. CSS lays out the
image and caption. Native PDFreactor page floats reserve space for the wrapper,
and the placement helper reads its destination page margins for the trim offsets.

The older image position and span controls are no longer offered on Image.
The legacy PDF float path remains available for already rendered markup that
uses the old classes and includes the legacy styles. Consumer projects with
copied Livingdocs components must update their Image definition and include the
new placement component when adopting this layout.
