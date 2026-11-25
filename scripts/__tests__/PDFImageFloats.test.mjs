import { afterEach, expect, test } from '@jest/globals';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

function transpile(file) {
  return ts.transpileModule(
    readFileSync(new URL('../../srl/srl/pdf/' + file, import.meta.url), 'utf8'),
    {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
      },
    },
  ).outputText;
}

const moduleURL = (source) =>
  'data:text/javascript;base64,' + Buffer.from(source).toString('base64');
const { default: PDFImageFloats, columnSpanWidths } = await import(
  moduleURL(
    transpile('PDFImageFloats.ts').replace(
      './PDFColumnReadingFlow.ts',
      moduleURL(transpile('PDFColumnReadingFlow.ts')),
    ),
  )
);
const originalWindow = globalThis.window;
const originalDocument = globalThis.document;
afterEach(() => {
  globalThis.window = originalWindow;
  globalThis.document = originalDocument;
});

test('does nothing outside PDFreactor', () => {
  globalThis.window = {};
  globalThis.document = undefined;
  expect(() => PDFImageFloats()).not.toThrow();
});

function fixture(count = 1) {
  const reads = [];
  const writes = [];
  const figures = Array.from({ length: count }, (_, index) => {
    const classes = new Set();
    const values = {};
    return {
      index,
      classes,
      values,
      parentElement: null,
      classList: {
        contains: (name) => classes.has(name),
        add: (name) => classes.add(name),
      },
      querySelector: (selector) =>
        selector.includes('desktop') ? { media: index } : null,
      style: {
        setProperty: (name, value) => {
          values[name] = value;
          writes.push(index);
        },
      },
    };
  });
  const layout = {
    getBoxDescriptions(element) {
      reads.push(element.media === undefined ? 'figure' : 'media');
      return [
        {
          pageIndex: writes.length ? 1 : 0,
          getBorderRect: () => ({ width: 250 }),
        },
      ];
    },
    getPageDescription(index) {
      return {
        getContentRect: () =>
          index
            ? { width: 600, top: 40, bottom: 750, left: 80, right: 680 }
            : { width: 500, top: 50, bottom: 750, left: 50, right: 550 },
        getTrimRect: () => ({ width: 720, right: 720, bottom: 800 }),
      };
    },
  };
  globalThis.window = { ro: { layout } };
  globalThis.document = {
    querySelectorAll: (selector) =>
      selector.includes('flow-around-image') ? [] : figures,
  };
  return { figures, reads, writes };
}

test('uses the destination page margins after a float moves to a different page', () => {
  const { figures } = fixture();
  PDFImageFloats();
  expect(figures[0].values).toMatchObject({
    '--srl-pdf-image-content-width': '600pt',
    '--srl-pdf-image-selected-width': '300pt',
    '--srl-pdf-image-top': '40pt',
    '--srl-pdf-image-left': '80pt',
    '--srl-pdf-image-right': '40pt',
    '--srl-pdf-image-bottom': '50pt',
  });
});

test('reads every original width before changing the DOM and stops after convergence', () => {
  const { figures, reads, writes } = fixture(2);
  PDFImageFloats();
  expect(reads.slice(0, 4)).toEqual(['figure', 'media', 'figure', 'media']);
  expect(
    figures.map((figure) => figure.values['--srl-pdf-image-selected-width']),
  ).toEqual(['300pt', '300pt']);
  expect(writes).toHaveLength(2 * 7 * 2);
  expect(figures[0].values['--srl-pdf-image-bottom']).toBe('0pt');
  expect(figures[1].values['--srl-pdf-image-bottom']).toBe('50pt');
  expect(reads).toHaveLength(4 + 2 * 2);
  const before = writes.length;
  PDFImageFloats();
  expect(writes).toHaveLength(before);
});

test('two of three text columns include the inner gutter and leave one caption column', () => {
  const result = columnSpanWidths(
    531,
    {
      count: 3,
      span: 2,
      gap: 14,
      widthRatio: 1,
      leftRatio: 0,
      rightRatio: 0,
    },
    'left',
  );
  expect(result['selected-width']).toBeCloseTo(349.3333);
  expect(result['span-caption-width']).toBeCloseTo(167.6667);
  expect(
    result['selected-width'] +
      result['span-gap'] +
      result['span-caption-width'],
  ).toBeCloseTo(531);
});

test('spans follow the original text frame and recalculate its inset on wider pages', () => {
  const columns = {
    count: 3,
    span: 2,
    gap: 14,
    widthRatio: 0.75,
    leftRatio: 0.25,
    rightRatio: 0,
  };
  const left = columnSpanWidths(600, columns, 'left');
  const right = columnSpanWidths(600, columns, 'right');
  expect(left['selected-width'] - right['selected-width']).toBeCloseTo(150);
  const wide = columnSpanWidths(900, columns, 'left');
  expect(wide['span-frame-left']).toBe(225);
  expect(wide['span-gap']).toBe(14);
  expect(wide['span-caption-width']).toBeCloseTo(215.6667);
});

test('retains the original width when a span is selected outside a column container', () => {
  const { figures } = fixture();
  figures[0].classes.add('srl-pdf-image-span-2');
  figures[0].closest = () => null;
  PDFImageFloats();
  expect(figures[0].values['--srl-pdf-image-selected-width']).toBe('300pt');
  expect(figures[0].classes.has('srl-pdf-image-float--span')).toBe(false);
});

test.each(['2', 'all'])(
  'reads a three-column container before lifting span %s and updates the destination width',
  (span) => {
    const { figures } = fixture();
    const figure = figures[0];
    figure.classes.add('srl-pdf-image-span-' + span);
    figure.classes.add('srl-image--bottom-left-of-page');
    const context = { classList: { contains: () => false } };
    figure.closest = () => context;
    const layout = globalThis.window.ro.layout;
    const original = layout.getBoxDescriptions;
    layout.getBoxDescriptions = (element) =>
      element === context
        ? [
            {
              pageIndex: 0,
              getBorderRect: () => ({ left: 0, right: 500, width: 500 }),
            },
          ]
        : original(element);
    globalThis.window.getComputedStyle = () => ({
      getPropertyValue: (name) =>
        ({ 'column-count': '3', 'column-gap': '20px' })[name] || '',
    });
    PDFImageFloats();
    expect(figure.values['--srl-pdf-image-span-gap']).toBe('15pt');
    expect(figure.values['--srl-pdf-image-selected-width']).toBe(
      span === '2' ? '395pt' : '600pt',
    );
    expect(figure.values['--srl-pdf-image-span-caption-width']).toBe(
      span === '2' ? '190pt' : '600pt',
    );
    expect(figure.classes.has('srl-pdf-image-float--stacked-caption')).toBe(
      span === 'all',
    );
  },
);
