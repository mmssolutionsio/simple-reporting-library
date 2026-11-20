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

The image component exposes the shared `image-position-in-pdf` property. Default
keeps the existing layout. Top/Bottom use PDFreactor page floats, with the image
touching the corresponding trim edge. The caption appears below a top image and
above a bottom image. The four corner options extend the image to the respective
horizontal trim edge and place the caption beside it, toward the page center.
Upper corner captions align with the image's bottom edge; lower corner captions
align with its top edge.

`image-column-span-in-pdf` controls the width of a page float independently of
its position: Default, one text column, two text columns, or all text columns.
The helper reads the original flowing/fixed column container and its actual gap
before lifting the image. Two columns in a three-column container therefore
leave exactly one caption column. The image extends from that grid to the page
edge. Spans covering all columns use a caption below top images or above bottom
images. Without a multi-column context the existing image width is retained.
The Default position remains in normal flow and does not apply this span option.

The PDF column container exposes `pdf-column-count`: two columns by default,
or three columns (`srl-pdf-columns-3`). The selected count applies only to that
container's own content, so nested containers keep their independent selection.
Balanced/unbalanced filling remains a separate option for either column count.

The PDF entry calls `PDFImageFloats` in `load`, before page-reference colors.
The helper lifts positioned images out of nested column containers, splitting
their ancestor shells without duplicating content or IDs. Original image widths
are measured before lifting. Actual page dimensions and margins are read from
PDFreactor, including customer overlays and different page formats. Native floats
reserve text space; this also works with two or three columns. Other output
channels keep their existing image layout.
Multiple images at the same edge stack in document order; only the outermost
image extends into the page margin, preventing overlapping images.

Corner caption widths default to two PDF grid columns. Customer overlays can set
`--srl-pdf-image-caption-columns`, `--srl-pdf-image-caption-width` (an explicit
length) and `--srl-pdf-image-caption-gap`. Without a caption, no caption width or
gap is reserved. The `afterLift` callback lets the entry refresh nested-container
margin markers before measuring the final pages.

The float reserves space between the entire figure (including its caption) and
the body text below top floats or above bottom floats. This defaults to the
`spacer.margins.group.visual-media.all` token, falling back to spacer 800 when
that group has no default. Customer overlays can override the distance with
`--srl-pdf-image-flow-gap`, independently of the image-to-caption gap.
