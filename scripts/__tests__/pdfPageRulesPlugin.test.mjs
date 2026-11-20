import { expect, test } from '@jest/globals';
import { mkdtemp, writeFile, rm, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build, createServer } from 'vite';
import {
  extractPdfPageRules,
  pdfPageRulesHooks,
} from '../../plugins/vitePdfPageRulesPlugin.js';

const css = `
@font-face { font-family: Example; src: url(example.woff2); }
:root { --unneeded-token: #123456; }
.unrelated-component { padding: 8px; }
/* @page fake {} */
@page { @top-left { content: element(publicationTitle); } }
@media print { @page landscape:left { size: A4 landscape; @bottom-right { content: counter(page); } } }
`;

test('extracts only real page rules, including nested named pages', () => {
  const result = extractPdfPageRules(css);
  expect(result).toContain('@page landscape:left');
  expect(result).toContain('element(publicationTitle)');
  expect(result).toContain('counter(page)');
  expect(result).not.toMatch(
    /font-face|unneeded-token|unrelated-component|fake/,
  );
});

test('Vite keeps the full stylesheet as CSS but bundles only page rules as JS', async () => {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'srl-page-rules-')));
  try {
    // No font assets are needed for this integration fixture.
    await writeFile(join(root, 'pdf.css'), css.replace(/@font-face[^}]*}/, ''));
    await writeFile(
      join(root, 'entry.js'),
      `import './pdf.css'; export { default } from './pdf.css?srl-page-rules';`,
    );
    const plugins = [{ name: 'test-page-rules', ...pdfPageRulesHooks() }];
    const result = await build({
      root,
      configFile: false,
      logLevel: 'silent',
      plugins,
      build: {
        write: false,
        lib: {
          entry: join(root, 'entry.js'),
          formats: ['es'],
          cssFileName: 'pdf',
        },
        minify: false,
      },
    });
    const output = (Array.isArray(result) ? result : [result]).flatMap(
      (build) => build.output,
    );
    const script = output.find((item) => item.type === 'chunk').code;
    const stylesheet = output.find((item) =>
      item.fileName.endsWith('.css'),
    ).source;
    expect(script).toContain('publicationTitle');
    expect(script).not.toMatch(/unrelated-component|unneeded-token/);
    expect(stylesheet).toContain('unrelated-component');

    const server = await createServer({
      root,
      configFile: false,
      logLevel: 'silent',
      plugins,
      server: { watch: null, fs: { allow: [root] } },
    });
    try {
      const dev = await server.transformRequest('/pdf.css?srl-page-rules');
      expect(dev.code).toContain('publicationTitle');
      expect(dev.code).not.toContain('unrelated-component');
    } finally {
      await server.close();
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('customer rule data follows CSS configuration order and excludes full CSS', async () => {
  const { writePdfOverlayPageRules } = await import(
    '../../scripts/css/pdfOverlayPageRules.js'
  );
  const { readFile, mkdir } = await import('node:fs/promises');
  const vm = await import('node:vm');
  const root = await mkdtemp(join(tmpdir(), 'srl-overlay-rules-'));
  try {
    await mkdir(join(root, 'customer'));
    await writeFile(
      join(root, 'customer/custom.js'),
      'window.customerScriptRan = true;',
    );
    await writeFile(
      join(root, 'pdf.css'),
      '@page { @top-left { content: "base"; } }',
    );
    await writeFile(
      join(root, 'customer/custom.css'),
      '.large-component {color:red} @page { @top-left { content: none; } @bottom-right { content: element(publicationTitle); } }',
    );
    await writeFile(
      join(root, 'customer/extra.css'),
      '@page { @bottom-right { content: element(extraTitle); } }',
    );
    writePdfOverlayPageRules(
      root,
      ['pdf.css', 'customer/custom.css', 'customer/extra.css'],
      join(root, 'customer'),
    );
    // Repeated CSS-only builds must replace the generated header, not duplicate it.
    writePdfOverlayPageRules(
      root,
      ['pdf.css', 'customer/custom.css', 'customer/extra.css'],
      join(root, 'customer'),
    );
    const context = { window: {} };
    vm.runInNewContext(
      await readFile(join(root, 'customer/custom.js'), 'utf8'),
      context,
    );
    expect(context.window.customerScriptRan).toBe(true);
    const rules = context.window.__srlPDFOverlayPageRules;
    expect(rules).not.toMatch(/large-component|"base"/);
    expect(rules.indexOf('publicationTitle')).toBeLessThan(
      rules.indexOf('extraTitle'),
    );
    expect(rules).toContain('content: none');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
