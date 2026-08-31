import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  buildDocsData,
  generateDocs,
  isDocsSource,
  normalizeGitHubReleases,
} from './generateDocs.js';

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, 'utf8');
}

describe('SRL docs generator', () => {
  let root;
  let projectRoot;
  let packageRoot;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'srl-docs-'));
    projectRoot = join(root, 'project');
    packageRoot = join(root, 'package');
    mkdirSync(projectRoot, { recursive: true });
    mkdirSync(packageRoot, { recursive: true });
    write(join(projectRoot, 'package.json'), '{"name":"example-project"}');
    write(
      join(packageRoot, 'package.json'),
      '{"name":"@simple-reporting/base","version":"2.0.0"}',
    );
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  test('combines global, project and Livingdocs SCSS with component properties', () => {
    write(
      join(packageRoot, 'scss/grid/mixins.scss'),
      `/// Render a minimum-width media query.\n/// @param {String} $breakpoint - Configured breakpoint.\n/// @example scss\n///   @include srl.grid-media-up(tablet-pt) { @content; }\n@mixin media-up($breakpoint) { @content; }`,
    );
    write(
      join(packageRoot, 'scss/colors/variables.scss'),
      '/// Prefix used for generated SRL CSS class names.\n/// @type String\n$class-prefix: "srl-" !default;',
    );
    write(
      join(packageRoot, 'scss/fonts/variables.scss'),
      '/// Prefix used for generated SRL CSS class names.\n/// @type String\n$class-prefix: "srl-" !default;',
    );
    write(
      join(projectRoot, 'srl.config.json'),
      '{"spacer":{"margins":{"group":{"text":{"all":200,"image":800}}}}}',
    );
    write(
      join(projectRoot, 'src/assets/scss/general.scss'),
      '.project { color: red; }',
    );
    write(
      join(packageRoot, 'livingdocs/999.Properties/grid/properties.json'),
      '{"width":{"label":"Width","type":"select","options":[]}}',
    );
    write(
      join(packageRoot, 'livingdocs/010.Titles/010.title/ld-conf.json'),
      '{"name":"title","label":"Title","properties":["width"]}',
    );
    write(
      join(packageRoot, 'livingdocs/010.Titles/010.title/title.html'),
      '<h1 class="srl-margin-group-text" doc-editable="title">Title</h1>',
    );
    write(
      join(packageRoot, 'livingdocs/010.Titles/010.title/scss/pdf.scss'),
      '@use "srl";\n@include srl.spacer-component-margin(text);\n.title { break-after: avoid; }',
    );

    const data = buildDocsData({ projectRoot, packageRoot });
    const mediaMixin = data.scss.api.find((item) => item.name === 'media-up');

    expect(data.scss.sources.map((source) => source.id)).toEqual([
      'global',
      'project',
      'livingdocs',
    ]);
    expect(mediaMixin.description).toBe('Render a minimum-width media query.');
    expect(mediaMixin.annotations.param).toEqual([
      '{String} $breakpoint - Configured breakpoint.',
    ]);
    expect(mediaMixin.usage).toBe(
      '@include srl.grid-media-up(tablet-pt) { @content; }',
    );
    expect(data.components).toHaveLength(1);
    expect(data.components[0].properties[0].definitions[0].scope).toBe(
      'global',
    );
    expect(data.properties[0].usedBy[0].name).toBe('title');
    expect(data.scss.marginGroups[0]).toMatchObject({
      name: 'text',
      className: 'srl-margin-group-text',
      usage: '@include srl.spacer-component-margin(text);',
      usedBy: [{ name: 'title' }],
    });
    expect(
      data.scss.variableGroups.find((group) => group.name === 'class-prefix'),
    ).toMatchObject({
      description: 'Prefix used for generated SRL CSS class names.',
      types: ['String'],
      declarations: [
        { module: 'colors', value: '"srl-"' },
        { module: 'fonts', value: '"srl-"' },
      ],
    });
    expect(data.issues).toEqual([]);
  });

  test('reports missing and duplicate property definitions', () => {
    write(
      join(projectRoot, 'livingdocs/999.Properties/one/properties.json'),
      '{"duplicate":{"type":"option"}}',
    );
    write(
      join(projectRoot, 'livingdocs/999.Properties/two/properties.json'),
      '{"duplicate":{"type":"option"}}',
    );
    write(
      join(projectRoot, 'livingdocs/010.Group/010.example/ld-conf.json'),
      '{"name":"example","properties":["missing"]}',
    );
    write(
      join(projectRoot, 'livingdocs/010.Group/010.example/example.html'),
      '<p>Example</p>',
    );

    const data = buildDocsData({ projectRoot, packageRoot });
    const codes = data.issues.map((issue) => issue.code);

    expect(codes).toContain('missing-property');
    expect(codes).toContain('duplicate-property');
  });

  test('recognizes documentation source files in every supported layer', () => {
    const options = { projectRoot, packageRoot };

    expect(
      isDocsSource(join(packageRoot, 'scss/grid/mixins.scss'), options),
    ).toBe(true);
    expect(
      isDocsSource(join(packageRoot, 'livingdocs/010.Group/a/a.html'), options),
    ).toBe(true);
    expect(
      isDocsSource(join(projectRoot, 'src/assets/scss/app.scss'), options),
    ).toBe(true);
    expect(
      isDocsSource(
        join(projectRoot, 'livingdocs/010.Group/a/docs.md'),
        options,
      ),
    ).toBe(true);
    expect(isDocsSource(join(projectRoot, 'src/App.vue'), options)).toBe(false);
  });

  test('normalizes published GitHub releases for the changelog', () => {
    expect(
      normalizeGitHubReleases([
        {
          tag_name: 'v2.1.0',
          name: 'Version 2.1.0',
          body: '- Added docs',
          html_url: 'https://example.test/releases/v2.1.0',
          published_at: '2026-08-28T10:00:00Z',
          draft: false,
          prerelease: false,
        },
        { tag_name: 'v2.2.0', draft: true },
      ]),
    ).toEqual([
      {
        version: '2.1.0',
        tag: 'v2.1.0',
        name: 'Version 2.1.0',
        body: '- Added docs',
        url: 'https://example.test/releases/v2.1.0',
        publishedAt: '2026-08-28T10:00:00Z',
        prerelease: false,
      },
    ]);
  });

  test('keeps cached release notes when GitHub is unavailable', async () => {
    const outputPath = join(projectRoot, '.srl/docs/data.json');
    const now = Date.parse('2026-08-28T10:00:00Z');
    const response = {
      ok: true,
      json: async () => [
        {
          tag_name: '1.2.3',
          body: 'Cached notes',
          html_url: 'https://example.test/releases/1.2.3',
          published_at: '2026-08-27T10:00:00Z',
        },
      ],
    };

    await generateDocs({
      projectRoot,
      packageRoot,
      outputPath,
      now,
      fetch: async () => response,
    });
    const result = await generateDocs({
      projectRoot,
      packageRoot,
      outputPath,
      now: now + 7 * 60 * 60 * 1000,
      fetch: async () => {
        throw new Error('offline');
      },
    });

    expect(result.data.changelog.status).toBe('cached');
    expect(result.data.changelog.latestVersion).toBe('1.2.3');
    expect(result.data.changelog.releases[0].body).toBe('Cached notes');
  });
});
