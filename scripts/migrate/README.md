# Project Migration

The migration command converts legacy project components, Livingdocs metadata and
SCSS files into the Simple Reporting Library project structure.

```bash
srl migrate --source migration --dry-run
srl migrate --source migration
```

The command writes migrated legacy components into `./livingdocs/998.deprecated`.
Existing Livingdocs groups are not removed. Component folders are numbered in the
order of the migration config, starting at `001`.

Before numbering, the command reads existing `ld-conf.json` files below
`./livingdocs`, excluding `./livingdocs/998.deprecated`. Legacy components whose
final `name` already exists are skipped, so the deprecated folder has no gaps in
its numbering.

## Expected Folder Structure

The recommended project-local structure is:

```txt
migration/
  config.json
  mappings.json
  components/
    example-component/
      example-component.html
  scss/
    variables.scss
    components/
      example-component.scss
```

The command also accepts legacy source folders:

```txt
migration/
  legacy/
    config.json
    components/
    scss/
```

or:

```txt
migration/
  legacy/
    src/
      config.json
      components/
      scss/
```

## Input Files

### `config.json`

`config.json` is the main source for components, component properties and image
ratios. A minimal example:

```json
{
  "imageRatios": {
    "3:2": {
      "label": "3:2",
      "ratio": "3x2"
    }
  },
  "componentProperties": {
    "background-color": {
      "label": "Background color",
      "type": "select",
      "options": [
        {
          "caption": "None"
        },
        {
          "caption": "Primary",
          "value": "srl-bg-primary-1000"
        }
      ]
    }
  },
  "components": [
    {
      "name": "example-component",
      "label": "Example Component",
      "properties": ["background-color"],
      "directives": {
        "text": {
          "recommendedMaxLength": 120
        }
      }
    }
  ]
}
```

Components can also be declared as an object:

```json
{
  "components": {
    "example-component": {
      "label": "Example Component"
    }
  }
}
```

### `mappings.json`

`mappings.json` is optional. Use it when the legacy project names or paths do not
map cleanly to the target structure.

```json
{
  "components": {
    "container-marginal": {
      "name": "aside-content-container",
      "source": "Container/container-marginal.html",
      "directives": {
        "main": "content",
        "container": "aside"
      },
      "scss": {
        "general.scss": "components/container-marginal.scss"
      }
    }
  },
  "scss": {
    "global": ["variables.scss", "mixins.scss"]
  }
}
```

The object key is the legacy component name. `name` is the new target component
name. `directives` maps old directive names to new directive names.

For components where content migration is too complex, keep the mapping entry and
set `contentMigration` to `false`. The component is then written to
`livingdocs/998.deprecated` under its legacy name and is not included in
`migration/content-migration.json`:

```json
{
  "components": {
    "complex-legacy-component": {
      "name": "new-component",
      "source": "Special/complex-legacy-component.html",
      "contentMigration": false
    }
  }
}
```

`DirectiveNameUpdates.Component` in the generated content migration JSON uses the
legacy component name, because directives are renamed on existing legacy content
before or together with the component rename.

`directiveNameUpdates` is also supported as an explicit array:

```json
{
  "components": {
    "list-container-ordered": {
      "targetName": "list-item-ordered-list",
      "source": "Lists/list-container-ordered.html",
      "directiveNameUpdates": [
        {
          "Previous": "list",
          "New": "items"
        }
      ]
    }
  }
}
```

## Component Sources

For a component named `example-component`, the command tries these files and
folders below the detected components directory:

```txt
components/example-component
components/example-component.html
components/example-component.vue
```

Inside a component folder it looks for:

```txt
example-component.html
template.html
index.html
example-component.vue
index.vue
```

For Vue files, only the content inside the first `<template>` block is used.

Legacy Livingdocs config blocks inside component HTML are removed automatically:

```html
<script type="ld-conf">
  {
    "name": "title-h1",
    "label": "Kapiteltitel (H1)",
    "properties": ["new-text"]
  }
</script>
```

The JSON inside this block is used as the base for the generated
`ld-conf.json`. Explicit declarations in `config.json` and `mappings.json`
override it. The effective priority is:

```txt
generated defaults
<script type="ld-conf"> JSON
config.json component entry
mappings.json component entry
```

If no source file is found, a small placeholder component is generated so the
migration can continue.

The root element of each migrated component receives the `deprecated` CSS class.
Existing classes on that root element are preserved.

## SCSS Mapping

Global SCSS files listed in `mappings.json` are copied to:

```txt
src/assets/scss/
```

Component SCSS is copied to:

```txt
livingdocs/998.deprecated/<order>.<component>/scss/
```

If no explicit SCSS mapping exists, the command tries:

```txt
scss/components/<component>.scss
scss/<component>.scss
```

Legacy `@import` statements are converted to:

```scss
@use '...' as *;
```

This preserves the old global import behavior closely enough for a first
migration pass. It is still worth reviewing the generated SCSS manually.

## Output

The command writes:

```txt
livingdocs/998.deprecated/<order>.<component>/<component>.html
livingdocs/998.deprecated/<order>.<component>/ld-conf.json
livingdocs/998.deprecated/<order>.<component>/scss/*.scss
livingdocs/999.Properties/<property>/properties.json
src/assets/scss/*.scss
livingdocs.config.json
migration/control.md
migration/content-migration.json
```

`migration/control.md` is a manual review report with the migration summary,
skipped existing components, migrated deprecated components, source paths and a
short checklist.

`migration/content-migration.json` contains `ComponentNameUpdates` and
`DirectiveNameUpdates` for the downstream content migration.

After writing files, the command runs the existing SRL mapper by default. This
regenerates the final Livingdocs design config from the `livingdocs/` folder.

## CLI Options

```txt
--source <source>  Migration source folder. Default: migration
--dry-run          Print the migration plan without writing files
--force            Overwrite existing generated files
--no-map           Skip running the SRL mapper after writing files
```

Recommended first run:

```bash
srl migrate --source migration --dry-run
```

Then run the actual migration:

```bash
srl migrate --source migration --force
```

## Standalone Usage

If the installed SRL package does not contain this migration command yet, copy
`migration/legacy-migrate.mjs` into the target project and run it from the
project root:

```bash
node migration/legacy-migrate.mjs --source migration --dry-run
node migration/legacy-migrate.mjs --source migration --force
```

The standalone script has no package imports. After the real migration, run the
project mapper/build manually, for example:

```bash
srl map
```
