# Legacy Migration Control

Migration source: `.`
Legacy target: `livingdocs/998.deprecated`
Components to migrate: 0
Skipped existing components: 0
Properties: 0
Image ratios: 0

## Manual Checks

- Existing Livingdocs groups outside `livingdocs/998.deprecated` are still present.
- Deprecated component folder numbering is continuous, starting at `001`.
- Every migrated component root element contains the `deprecated` class.
- Skipped components already exist as non-deprecated Livingdocs components.
- Placeholder components are reviewed manually.
- SCSS files were copied and `@import` statements were converted as expected.

## Migrated Components

No legacy components are scheduled for migration.

## Skipped Existing Components

No legacy components were skipped.

## Generated Files

- `livingdocs/998.deprecated/<order>.<component>/<component>.html`
- `livingdocs/998.deprecated/<order>.<component>/ld-conf.json`
- `livingdocs/998.deprecated/<order>.<component>/scss/*.scss`
- `livingdocs/999.Properties/<property>/properties.json`
- `src/assets/scss/*.scss`
- `livingdocs.config.json`
- `migration/control.md`
- `migration/content-migration.json`

