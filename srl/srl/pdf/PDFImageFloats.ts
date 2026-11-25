interface LayoutRect {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
}

interface ImageLayout {
  forceRelayout?(): void;
  getBoxDescriptions(element: Element): Array<{
    pageIndex: number;
    getBorderRect(unit: string): LayoutRect;
    getContentRect?(unit: string): LayoutRect;
  }>;
  getPageDescription(index: number): {
    getContentRect(unit: string): LayoutRect;
    getTrimRect(unit: string): LayoutRect;
  };
}

const positions = [
  'srl-top-of-page',
  'srl-bottom-of-page',
  'srl-image--top-left-of-page',
  'srl-image--top-right-of-page',
  'srl-image--bottom-left-of-page',
  'srl-image--bottom-right-of-page',
];
const selector = positions.map((name) => '.srl-image.' + name).join(',');
const contentSelector = 'img,svg,object,embed,table,hr,video,iframe,canvas';

interface ColumnSpan {
  count: number;
  span: number;
  gap: number;
  widthRatio: number;
  leftRatio: number;
  rightRatio: number;
}

function lengthInPoints(value: string): number {
  const number = parseFloat(value);
  if (!Number.isFinite(number)) return 0;
  if (value.endsWith('mm')) return (number * 72) / 25.4;
  if (value.endsWith('cm')) return (number * 72) / 2.54;
  if (value.endsWith('in')) return number * 72;
  if (value.endsWith('pt')) return number;
  return number * 0.75;
}

function readColumnSpan(
  figure: HTMLElement,
  layout: ImageLayout,
  page: LayoutRect,
  pageIndex: number,
): ColumnSpan | null {
  const requested = ['1', '2', 'all'].find((span) =>
    figure.classList.contains('srl-pdf-image-span-' + span),
  );
  if (!requested) return null;
  const context = figure.closest(
    '.srl-pdf-column-container__content, .srl-columns__inner',
  );
  if (!context) return null;
  const style = window.getComputedStyle(context);
  const boxes = layout.getBoxDescriptions(context);
  const box = boxes.find((box) => box.pageIndex === pageIndex) || boxes[0];
  if (!box) return null;
  let count = parseInt(style.getPropertyValue('column-count'), 10);
  let gap = lengthInPoints(style.getPropertyValue('column-gap'));
  if (context.classList.contains('srl-columns__inner')) {
    const columns = Array.from(context.children).filter(
      (column) =>
        column.classList.contains('srl-columns__column') &&
        window.getComputedStyle(column).getPropertyValue('display') !== 'none',
    );
    count = columns.length;
    const first = columns[0] && layout.getBoxDescriptions(columns[0])[0];
    const second = columns[1] && layout.getBoxDescriptions(columns[1])[0];
    if (first && second && first.pageIndex === second.pageIndex) {
      gap = Math.max(
        0,
        second.getBorderRect('pt').left - first.getBorderRect('pt').right,
      );
    }
  }
  if (!Number.isFinite(count) || count < 2) return null;
  const rect = box.getContentRect?.('pt') || box.getBorderRect('pt');
  return {
    count,
    span: requested === 'all' ? count : Math.min(count, Number(requested)),
    gap,
    widthRatio: Math.min(1, rect.width / page.width),
    leftRatio: Math.max(0, rect.left / page.width),
    rightRatio: Math.max(0, (page.width - rect.right) / page.width),
  };
}

export function columnSpanWidths(
  contentWidth: number,
  columns: ColumnSpan,
  side: 'left' | 'right' | '',
): Record<string, number> {
  const width = columns.widthRatio * contentWidth;
  const gap = Math.min(columns.gap, width / (columns.count - 1));
  const column = (width - (columns.count - 1) * gap) / columns.count;
  const remaining = columns.count - columns.span;
  const inset =
    side === 'left'
      ? columns.leftRatio
      : side === 'right'
        ? columns.rightRatio
        : 0;
  return {
    'selected-width':
      column * columns.span + gap * (columns.span - 1) + inset * contentWidth,
    'span-caption-width': remaining
      ? column * remaining + gap * (remaining - 1)
      : width,
    'span-gap': gap,
    'span-frame-left': columns.leftRatio * contentWidth,
  };
}

function imageSide(figure: HTMLElement): 'left' | 'right' | '' {
  if (
    figure.classList.contains('srl-image--top-left-of-page') ||
    figure.classList.contains('srl-image--bottom-left-of-page')
  )
    return 'left';
  if (
    figure.classList.contains('srl-image--top-right-of-page') ||
    figure.classList.contains('srl-image--bottom-right-of-page')
  )
    return 'right';
  return '';
}

function hasContent(element: Element): boolean {
  return (
    !!element.textContent?.trim() || !!element.querySelector(contentSelector)
  );
}

// Split wrappers instead of moving a figure ahead of the entire column container.
// Existing text nodes, links and IDs remain in document order; only ancestor shells
// are cloned. Keep empty flex-column slots so the remaining text retains its width.
function liftFigure(figure: HTMLElement, container: Element): void {
  const boundary = container.parentElement;
  while (figure.parentElement && figure.parentElement !== boundary) {
    const parent = figure.parentElement;
    const after = parent.cloneNode(false) as HTMLElement;
    after.removeAttribute('id');
    for (const shell of [parent, after]) {
      for (const name of Array.from(shell.classList)) {
        if (/-(first|last)$/.test(name)) shell.classList.remove(name);
      }
    }
    while (figure.nextSibling) after.appendChild(figure.nextSibling);
    parent.after(figure);
    if (hasContent(after)) figure.after(after);

    if (parent.classList.contains('srl-columns__inner')) {
      const slots = new Map<string, Element>();
      for (const half of [parent, after]) {
        for (const child of Array.from(half.children)) {
          const name = Array.from(child.classList).find((value) =>
            /^srl-columns__column--\d+$/.test(value),
          );
          if (name) slots.set(name, child);
        }
      }
      for (const half of [parent, after]) {
        if (!hasContent(half)) continue;
        for (const [name, example] of Array.from(slots).sort()) {
          const existing = Array.from(half.children).find((child) =>
            child.classList.contains(name),
          );
          const column = existing || (example.cloneNode(false) as Element);
          if (!existing) column.removeAttribute('id');
          half.appendChild(column);
        }
      }
    }
    if (!hasContent(parent) && !parent.id) parent.remove();
  }
}

function outerLayoutContainer(figure: HTMLElement): Element | null {
  let container: Element | null = null;
  let ancestor = figure.parentElement;
  while (
    ancestor &&
    !ancestor.matches(
      '.srl-article, .srl-article-root, .srl-pdf-landscape-container, body',
    )
  ) {
    if (
      ancestor.matches(
        '.srl-nested-container, .srl-pdf-column-container, .srl-columns',
      )
    )
      container = ancestor;
    ancestor = ancestor.parentElement;
  }
  return container;
}

// CSS page floats stay in their source fragmentation context. Move the wrapper
// to page flow and carry over the source column count and gap before splitting.
function liftPlacementContainers(): boolean {
  const placements = [];
  for (const placement of document.querySelectorAll<HTMLElement>(
    '.srl-pdf-placement-container.srl-pdf-placement--top, .srl-pdf-placement-container.srl-pdf-placement--bottom',
  )) {
    const columns = placement.parentElement;
    const image = placement.firstElementChild;
    if (
      !columns?.matches('.srl-pdf-column-container__content') ||
      !image?.matches('.srl-image') ||
      placement.childElementCount !== 1
    )
      continue;
    const style = window.getComputedStyle(columns);
    const count = Number(style.getPropertyValue('column-count'));
    if (count !== 2 && count !== 3) continue;
    const span = image.classList.contains('srl-full-width')
      ? count
      : image.classList.contains('srl-wide-width')
        ? 2
        : 1;

    placements.push({
      placement,
      count,
      span,
      gap: style.getPropertyValue('column-gap'),
    });
  }

  let lifted = false;
  for (const { placement, count, span, gap } of placements) {
    const container = outerLayoutContainer(placement);
    if (!container) continue;

    placement.style.setProperty('--srl-pdf-placement-columns', String(count));
    placement.style.setProperty('--srl-pdf-placement-span', String(span));
    placement.style.setProperty('--srl-pdf-placement-gap', gap);
    placement.classList.add('srl-pdf-placement-container--placed');
    if (span === count)
      placement.classList.add('srl-pdf-placement-container--full-span');

    liftFigure(placement, container);
    lifted = true;
  }
  return lifted;
}

/** Run synchronously in load, before helpers that depend on final page indices. */
export default function PDFImageFloats(afterLift?: () => void): void {
  const layout = (window as Window & { ro?: { layout: ImageLayout } }).ro
    ?.layout;
  if (!layout) return;
  const placementsLifted = liftPlacementContainers();
  const figures = Array.from(
    document.querySelectorAll<HTMLElement>(selector),
  ).filter(
    (figure) =>
      !figure.classList.contains('srl-pdf-image-float') &&
      !figure.parentElement?.classList.contains(
        'srl-pdf-placement-container--placed',
      ),
  );
  if (!figures.length) {
    if (placementsLifted) afterLift?.();
    return;
  }

  if (placementsLifted) layout.forceRelayout?.();

  // Read all legacy image sizes before lifting them.
  const snapshots = figures
    .map((figure) => {
      const media = figure.querySelector(
        '.srl-image__image-container--desktop',
      );
      const box = layout.getBoxDescriptions(figure)[0];
      const mediaBox = media && layout.getBoxDescriptions(media)[0];
      if (!box || !mediaBox) return null;
      const page = layout
        .getPageDescription(box.pageIndex)
        .getContentRect('pt');
      const trim = layout.getPageDescription(box.pageIndex).getTrimRect('pt');
      const columns = readColumnSpan(figure, layout, page, box.pageIndex);
      const initial: Record<string, number> = {
        'content-width': page.width,
        'page-width': trim.width,
        'selected-width': Math.min(
          page.width,
          mediaBox.getBorderRect('pt').width,
        ),
        top: page.top,
        bottom: trim.bottom - page.bottom,
        left: page.left,
        right: trim.right - page.right,
      };
      if (columns)
        Object.assign(
          initial,
          columnSpanWidths(page.width, columns, imageSide(figure)),
        );
      return {
        figure,
        fraction: mediaBox.getBorderRect('pt').width / page.width,
        columns,
        initial,
      };
    })
    .filter((snapshot) => snapshot !== null);
  if (!snapshots.length) {
    if (placementsLifted) afterLift?.();
    return;
  }

  for (const { figure, initial, columns } of snapshots) {
    const container = outerLayoutContainer(figure);
    if (container) liftFigure(figure, container);
    for (const [name, value] of Object.entries(initial)) {
      figure.style.setProperty('--srl-pdf-image-' + name, value + 'pt');
    }
    figure.classList.add('srl-pdf-image-float');
    if (columns) {
      figure.classList.add('srl-pdf-image-float--span');
      if (columns.span === columns.count && imageSide(figure))
        figure.classList.add('srl-pdf-image-float--stacked-caption');
    }
    const caption = figure.querySelector('.srl-image__caption');
    if (caption && hasContent(caption)) {
      figure.classList.add('srl-pdf-image-float--caption');
    }
  }
  afterLift?.();
  layout.forceRelayout?.();

  // Relayout may move a float to a page with different margins or orientation.
  // Batch reads and writes and stop when geometry stabilizes; never recurse.
  let previous = '';
  for (let pass = 0; pass < 6; pass++) {
    const updates = snapshots
      .map(({ figure, fraction, columns }) => {
        const box = layout.getBoxDescriptions(figure)[0];
        if (!box) return null;
        const page = layout.getPageDescription(box.pageIndex);
        const content = page.getContentRect('pt');
        const trim = page.getTrimRect('pt');
        const values: Record<string, number> = {
          'content-width': content.width,
          'page-width': trim.width,
          'selected-width': Math.min(1, fraction) * content.width,
          top: content.top,
          bottom: trim.bottom - content.bottom,
          left: content.left,
          right: trim.right - content.right,
        };
        if (columns)
          Object.assign(
            values,
            columnSpanWidths(content.width, columns, imageSide(figure)),
          );
        return {
          figure,
          pageIndex: box.pageIndex,
          top: positions.some(
            (name) => name.includes('top') && figure.classList.contains(name),
          ),
          values,
        };
      })
      .filter((update) => update !== null);
    // Native floats stack in document order. Only the outermost float of each
    // side may consume the page margin, otherwise negative margins overlap them.
    for (let index = 0; index < updates.length; index++) {
      const current = updates[index];
      const outer = updates.some(
        (other, otherIndex) =>
          other.pageIndex === current.pageIndex &&
          other.top === current.top &&
          (current.top ? otherIndex < index : otherIndex > index),
      );
      if (outer) current.values[current.top ? 'top' : 'bottom'] = 0;
    }
    const signature = JSON.stringify(updates.map(({ values }) => values));
    if (signature === previous) break;
    previous = signature;
    for (const { figure, values } of updates) {
      for (const [name, value] of Object.entries(values)) {
        figure.style.setProperty('--srl-pdf-image-' + name, value + 'pt');
      }
    }
  }
}
