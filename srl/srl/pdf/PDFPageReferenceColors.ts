interface PageMarginContent {
  selector: string;
  box: string;
  content: string;
}

interface PDFreactorLayout {
  getBoxDescriptions(element: Element): Array<{ pageIndex: number }>;
}

type PDFreactorWindow = Window & {
  __srlPDFOverlayPageRules?: string;
  ro?: { layout: PDFreactorLayout };
};

const marginBoxes = [
  'top-left-corner',
  'top-left',
  'top-center',
  'top-right',
  'top-right-corner',
  'right-top',
  'right-middle',
  'right-bottom',
  'bottom-right-corner',
  'bottom-right',
  'bottom-center',
  'bottom-left',
  'bottom-left-corner',
  'left-bottom',
  'left-middle',
  'left-top',
];

// Read @page blocks without traversing PDFreactor's cyclic CSSOM objects.
// The compiled page rules are supplied by the PDF entry because userStyleSheets are
// not exposed through document.styleSheets by PDFreactor.
function blockEnd(clean: string, start: number): number {
  let depth = 1;
  let quote = '';
  let end = start;
  for (; end < clean.length && depth; end++) {
    const char = clean[end];
    if (quote) {
      if (char === '\\') end++;
      else if (char === quote) quote = '';
    } else if (char === '"' || char === "'") quote = char;
    else if (char === '{') depth++;
    else if (char === '}') depth--;
  }
  return end;
}

export function pageContents(css: string): PageMarginContent[] {
  const contents: PageMarginContent[] = [];
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const pages = /@page\s*([^{}]*)\{/g;
  let page: RegExpExecArray | null;
  while ((page = pages.exec(clean))) {
    const start = pages.lastIndex;
    const end = blockEnd(clean, start);
    const text = clean.slice(start, end - 1);
    for (const box of marginBoxes) {
      const boxes = new RegExp('@' + box + '\\s*\\{', 'g');
      while (boxes.exec(text)) {
        const end = blockEnd(text, boxes.lastIndex);
        const body = text.slice(boxes.lastIndex, end - 1);
        boxes.lastIndex = end;
        const declarations = [
          ...body.matchAll(
            /(?:^|;)\s*content\s*:\s*((?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[^;"'])+)/gi,
          ),
        ];
        const content = declarations.at(-1)?.[1];
        if (content) contents.push({ selector: page[1].trim(), box, content });
      }
    }
    pages.lastIndex = end;
  }
  return contents;
}

function runningContents(compiledPageRules: string): PageMarginContent[] {
  // PDFreactor's CSSOM can contain cycles through imported/parent stylesheets.
  // Read the extracted page rules and inline style text directly instead of walking it.
  const contents = pageContents(compiledPageRules);
  const overlayRules = (window as PDFreactorWindow).__srlPDFOverlayPageRules;
  if (overlayRules) contents.push(...pageContents(overlayRules));
  for (const style of document.querySelectorAll('style')) {
    contents.push(...pageContents(style.textContent || ''));
  }
  return contents;
}

export function resolveContentVariables(
  content: string,
  style: CSSStyleDeclaration,
): string {
  let result = content;
  for (let pass = 0; pass < 32; pass++) {
    const start = result.indexOf('var(');
    if (start < 0) break;
    let end = start + 4;
    let depth = 1;
    let quote = '';
    for (; end < result.length && depth; end++) {
      const char = result[end];
      if (quote) {
        if (char === '\\') end++;
        else if (char === quote) quote = '';
      } else if (char === '"' || char === "'") quote = char;
      else if (char === '(') depth++;
      else if (char === ')') depth--;
    }
    if (depth) break;
    const args = result.slice(start + 4, end - 1);
    const comma = args.indexOf(',');
    const name = (comma < 0 ? args : args.slice(0, comma)).trim();
    const value =
      style.getPropertyValue(name).trim() ||
      (comma < 0 ? '' : args.slice(comma + 1).trim());
    if (!value) break;
    const next = result.slice(0, start) + value + result.slice(end);
    if (next === result) break;
    result = next;
  }
  return result;
}

export default function PDFPageReferenceColors(compiledPageRules = ''): void {
  const layout = (window as PDFreactorWindow).ro?.layout;
  if (!layout) return;

  const references = document.querySelectorAll('.srl-pdf-page');
  const pages = new Map<
    number,
    { scheme: string; color: string; contents: PageMarginContent[] }
  >();
  const contents = runningContents(compiledPageRules);
  const schemes = new Set<string>();
  // Read every layout snapshot before changing the DOM to avoid repeated relayouts.
  for (const reference of references) {
    const scheme = ['black-1000', 'white-1000', 'primary-1000'].find((value) =>
      reference.classList.contains('srl-color-' + value),
    );
    if (!scheme || reference.classList.contains('srl-hide-page-margin-boxes'))
      continue;
    const style = window.getComputedStyle(reference);
    const color = style.getPropertyValue('--srl-color-' + scheme).trim();
    if (!color) continue;
    for (const box of layout.getBoxDescriptions(reference)) {
      pages.set(box.pageIndex + 1, {
        scheme,
        color,
        contents: contents.map((rule) => ({
          ...rule,
          content: resolveContentVariables(rule.content, style),
        })),
      });
      schemes.add(scheme);
    }
  }
  if (!pages.size) return;

  const running: Array<{ element: HTMLElement; name: string }> = [];
  for (const element of document.querySelectorAll<HTMLElement>('*')) {
    const position = window.getComputedStyle(element).position;
    const name = position.match(/^running\(\s*([\w-]+)\s*\)$/)?.[1];
    if (name) running.push({ element, name });
  }

  // A running element keeps its DOM styles rather than inheriting the margin box color.
  // Give each scheme its own running flow; ordinary pages retain the original flow.
  for (const { element, name } of running) {
    for (const scheme of schemes) {
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.setProperty(
        'position',
        'running(' + name + '-srl-' + scheme + ')',
        'important',
      );
      clone.classList.add('srl-page-reference-running--' + scheme);
      for (const node of [clone, ...clone.querySelectorAll<HTMLElement>('*')]) {
        node.style.setProperty(
          'color',
          'var(--srl-color-' + scheme + ')',
          'important',
        );
      }
      clone.removeAttribute('id');
      for (const child of clone.querySelectorAll('[id]'))
        child.removeAttribute('id');
      element.parentNode?.insertBefore(clone, element);
    }
  }

  const rules = [];
  for (const scheme of schemes) {
    const selector = '.srl-page-reference-running--' + scheme;
    rules.push(
      selector +
        ', ' +
        selector +
        ' *, ' +
        selector +
        '::before, ' +
        selector +
        '::after, ' +
        selector +
        ' *::before, ' +
        selector +
        ' *::after { color: var(--srl-color-' +
        scheme +
        ') !important; }',
    );
  }
  for (const [page, { scheme, color, contents }] of pages) {
    const nth = ':-ro-nth(' + page + ')';
    const declarations = 'color: ' + color + ' !important;';
    rules.push(
      '@page ' +
        nth +
        ' { ' +
        marginBoxes
          .map((box) => '@' + box + ' { ' + declarations + ' }')
          .join(' ') +
        ' }',
    );
    for (const { selector, box, content } of contents) {
      // Page selectors may contain commas inside :-ro-nth(). Split only at depth zero.
      const selectors = selector
        .split(/,(?![^()]*\))/)
        .map((value) => value.trim() + nth)
        .join(', ');
      const colored = content.replace(
        /element\(\s*([\w-]+)/g,
        'element($1-srl-' + scheme,
      );
      rules.push(
        '@page ' +
          selectors +
          ' { @' +
          box +
          ' { content: ' +
          colored +
          '; } }',
      );
    }
  }
  const style = document.createElement('style');
  style.textContent = rules.join('\n');
  document.head.appendChild(style);
}
