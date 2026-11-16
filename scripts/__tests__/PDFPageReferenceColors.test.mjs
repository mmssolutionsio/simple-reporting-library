import { afterEach, expect, test } from '@jest/globals';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(
  new URL('../../srl/srl/pdf/PDFPageReferenceColors.ts', import.meta.url),
  'utf8',
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
  },
});
const {
  default: PDFPageReferenceColors,
  pageContents,
  resolveContentVariables,
} = await import(
  'data:text/javascript;base64,' + Buffer.from(outputText).toString('base64')
);

const originalWindow = globalThis.window;
const originalDocument = globalThis.document;
afterEach(() => {
  globalThis.window = originalWindow;
  globalThis.document = originalDocument;
});

test('extracts running contents and counters from compiled PDF CSS', () => {
  const result = pageContents(`/* @page ignored {} */
    @page { @top-left { content: element(publicationTitle); } }
    @page custom:left { @right-middle { content: element(navigation, last); } }
    @page { @bottom-center { content: "Page } " counter(page); } }
  `);
  expect(result).toEqual([
    { selector: '', box: 'top-left', content: 'element(publicationTitle)' },
    {
      selector: 'custom:left',
      box: 'right-middle',
      content: 'element(navigation, last)',
    },
    { selector: '', box: 'bottom-center', content: '"Page } " counter(page)' },
  ]);
});

test('uses compiled user CSS without recursing through cyclic PDFreactor stylesheets', () => {
  const appended = [];
  const sheet = {};
  const imported = { cssText: '@import "fonts.css";', styleSheet: sheet };
  sheet.cssRules = [imported];
  const reference = {
    classList: { contains: (value) => value === 'srl-color-white-1000' },
  };
  globalThis.window = {
    ro: { layout: { getBoxDescriptions: () => [{ pageIndex: 7 }] } },
    __srlPDFOverlayPageRules:
      '@page { @top-left { content: none; } @bottom-right { content: var(--footer); } }',
    getComputedStyle: () => ({
      getPropertyValue: (name) =>
        name === '--footer'
          ? 'element(publicationTitle)'
          : 'rgb(255, 255, 255)',
    }),
  };
  globalThis.document = {
    styleSheets: [sheet],
    querySelectorAll: (selector) =>
      selector === '.srl-pdf-page' ? [reference] : [],
    createElement: () => ({}),
    head: { appendChild: (style) => appended.push(style) },
  };
  PDFPageReferenceColors(
    '@page { @top-left { content: element(publicationTitle); } }',
  );
  expect(appended).toHaveLength(1);
  expect(appended[0].textContent).toContain('@page :-ro-nth(8)');
  expect(appended[0].textContent).toContain(
    'element(publicationTitle-srl-white-1000)',
  );
  expect(
    appended[0].textContent.match(/color: rgb\(255, 255, 255\) !important/g),
  ).toHaveLength(16);
  expect(appended[0].textContent).not.toContain(':-ro-nth(9)');
  expect(appended[0].textContent).toContain(
    '@bottom-right { content: element(publicationTitle-srl-white-1000)',
  );
  expect(appended[0].textContent.lastIndexOf('content: none')).toBeGreaterThan(
    appended[0].textContent.indexOf('publicationTitle-srl-white-1000'),
  );
});

test('resolves nested content variables and terminates on cycles', () => {
  const values = {
    '--footer': 'var(--title)',
    '--title': 'element(customTitle)',
    '--cycle': 'var(--cycle)',
  };
  const style = { getPropertyValue: (name) => values[name] || '' };
  expect(resolveContentVariables('var(--footer)', style)).toBe(
    'element(customTitle)',
  );
  expect(resolveContentVariables('var(--missing, counter(page))', style)).toBe(
    'counter(page)',
  );
  expect(resolveContentVariables('var(--cycle)', style)).toBe('var(--cycle)');
});
