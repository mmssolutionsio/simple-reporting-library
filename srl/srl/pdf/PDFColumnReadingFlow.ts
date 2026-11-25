import type { ImageLayout, LayoutRect } from './PDFImageFloats.ts';

const contentSelector =
  '.srl-pdf-column-container.srl-pdf-columns-flow-around-image > .srl-grid__inner > .srl-pdf-column-container__content';
const activeClass = 'srl-pdf-column-flow-active';
const tolerance = 0.5;

const near = (a: number, b: number) => Math.abs(a - b) <= tolerance;
const points = (value: number) => value + 'pt';

function setBox(
  element: HTMLElement,
  left: number,
  top: number,
  width: number,
  height?: number,
): void {
  element.style.left = points(left);
  element.style.top = points(top);
  element.style.width = points(width);
  if (height !== undefined) element.style.height = points(height);
}

function contains(outer: LayoutRect, inner: LayoutRect): boolean {
  return (
    inner.left >= outer.left - tolerance &&
    inner.right <= outer.right + tolerance &&
    inner.top >= outer.top - tolerance &&
    inner.bottom <= outer.bottom + tolerance
  );
}

function tryReadingFlow(
  content: HTMLElement,
  layout: ImageLayout,
  flowName: string,
): void {
  const children = Array.from(content.children) as HTMLElement[];
  const image = children.find((child) =>
    child.matches('.srl-image.srl-wide-width:not(.srl-full-width)'),
  );
  const paragraphs = children.filter((child) => child !== image);
  if (
    !image ||
    children[0] === image ||
    children[children.length - 1] === image ||
    paragraphs.some((child) => !child.matches('.srl-paragraph'))
  )
    return;

  const frames = layout.getBoxDescriptions(content);
  const images = layout.getBoxDescriptions(image);
  if (!frames.length || images.length !== 1) return;
  const [imageBox] = images;
  const imagePage = frames.findIndex(
    (frame) => frame.pageIndex === imageBox.pageIndex,
  );
  if (
    imagePage < 0 ||
    frames.some(
      (frame, index) => frame.pageIndex !== frames[0].pageIndex + index,
    )
  )
    return;

  const style = window.getComputedStyle(content);
  const count = Number(style.getPropertyValue('column-count'));
  if (count !== 2 && count !== 3) return;
  const gap = parseFloat(style.getPropertyValue('column-gap')) * 0.75;
  const areas = frames.map(
    (frame) => frame.getContentRect?.('pt') ?? frame.getBorderRect('pt'),
  );
  const area = areas[imagePage];
  const picture = imageBox.getBorderRect('pt');
  const gutters = (count - 1) * gap;
  const columnWidth = (area.width - gutters) / count;
  const step = columnWidth + gap;
  if (
    !Number.isFinite(columnWidth) ||
    columnWidth <= 0 ||
    areas.some((frame) => frame.width <= gutters || frame.height <= 0) ||
    !near(picture.left, area.left) ||
    !near(picture.width, 2 * columnWidth + gap)
  )
    return;

  const renderedColumns = new Set<number>();
  for (const paragraph of paragraphs) {
    const boxes = layout.getBoxDescriptions(paragraph);
    if (!boxes.length) return;
    for (const box of boxes) {
      if (box.pageIndex !== imageBox.pageIndex) continue;
      const offset = box.getBorderRect('pt').left - area.left;
      const column = Math.round(offset / step);
      if (near(offset, column * step) && column >= 0 && column < count)
        renderedColumns.add(column);
    }
  }
  if (renderedColumns.size !== count) return;

  const imageMargins = imageBox.getMarginRect('pt');
  const aboveGap = Math.max(0, picture.top - imageMargins.top);
  const belowGap = Math.max(0, imageMargins.bottom - picture.bottom);
  const topHeight = picture.top - area.top - aboveGap / 2;
  const bottomY = picture.bottom - area.top + belowGap / 2;
  // The single-page layout keeps two lines of extra capacity in the right column.
  const lineHeight =
    parseFloat(
      window.getComputedStyle(paragraphs[0]).getPropertyValue('line-height'),
    ) * 0.75;
  const reserve =
    count === 3 && frames.length === 1 && Number.isFinite(lineHeight)
      ? 2 * lineHeight
      : 0;
  const bottomHeight = area.height - bottomY - reserve;
  if (topHeight <= 0 || bottomHeight <= 0) return;

  const source = document.createElement('div');
  source.className = 'srl-pdf-column-flow-source';
  const pages = areas.map((page, index) => {
    const width = (page.width - gutters) / count;
    const stride = width + gap;
    const geometry = [];
    for (let column = 0; column < count; column++) {
      const x = column * stride;
      if (index === imagePage && column < 2) {
        geometry.push([x, 0, topHeight], [x, bottomY, bottomHeight]);
      } else {
        geometry.push([x, 0, page.height]);
      }
    }
    const regions = geometry.map(([x, y, height]) => {
      const region = document.createElement('div');
      region.className = 'srl-pdf-column-flow-region';
      region.style.setProperty('-ro-flow-from', flowName);
      setBox(region, x, y, width, height);
      return region;
    });
    const frame = index === 0 ? content : document.createElement('div');
    if (index > 0) {
      frame.className =
        content.className +
        ' ' +
        activeClass +
        ' srl-pdf-column-flow-continuation';
      frame.style.height = points(page.height);
      frame.append(...regions);
    }
    return { frame, regions, pageIndex: frames[index].pageIndex };
  });
  const pictureFrame = document.createElement('div');
  pictureFrame.className = 'srl-pdf-column-flow-image';
  setBox(pictureFrame, 0, picture.top - area.top, picture.width);

  const originalNodes = Array.from(content.childNodes);
  const originalStyles = [content, ...paragraphs].map(
    (element) => [element, element.getAttribute('style')] as const,
  );
  const outerContainer = content.parentElement?.parentElement;
  const pagedClass = 'srl-pdf-column-flow-paged';
  let applied = false;
  try {
    for (const paragraph of paragraphs) {
      paragraph.style.setProperty('-ro-flow-into', flowName);
      source.appendChild(paragraph);
    }
    pictureFrame.appendChild(image);
    content.classList.add(activeClass);
    if (pages.length > 1) outerContainer?.classList.add(pagedClass);
    content.style.height = points(areas[0].height);
    content.append(source, ...pages[0].regions);
    for (let index = 1; index < pages.length; index++)
      pages[index - 1].frame.after(pages[index].frame);
    pages[imagePage].frame.appendChild(pictureFrame);
    layout.forceRelayout?.();

    const inspect = () => {
      const renderedImage = layout.getBoxDescriptions(image)[0];
      if (
        renderedImage?.pageIndex !== imageBox.pageIndex ||
        !near(renderedImage.getBorderRect('pt').top, picture.top) ||
        !near(renderedImage.getBorderRect('pt').left, picture.left) ||
        !near(renderedImage.getBorderRect('pt').bottom, picture.bottom) ||
        !near(renderedImage.getBorderRect('pt').width, picture.width) ||
        pages.some(({ frame, pageIndex }, index) => {
          const boxes = layout.getBoxDescriptions(frame);
          const rect =
            boxes[0]?.getContentRect?.('pt') ?? boxes[0]?.getBorderRect('pt');
          return (
            boxes.length !== 1 ||
            boxes[0].pageIndex !== pageIndex ||
            !rect ||
            !contains(areas[index], rect) ||
            !contains(rect, areas[index])
          );
        })
      )
        return null;

      const regionBoxes = pages.flatMap(({ regions, pageIndex }, page) =>
        regions.map((region) => {
          const boxes = layout.getBoxDescriptions(region);
          if (boxes.length !== 1 || boxes[0].pageIndex !== pageIndex)
            return null;
          const rect =
            boxes[0].getContentRect?.('pt') ?? boxes[0].getBorderRect('pt');
          const area = areas[page];
          if (
            !contains(area, rect) ||
            !near(rect.left, area.left + parseFloat(region.style.left)) ||
            !near(rect.top, area.top + parseFloat(region.style.top)) ||
            !near(rect.width, parseFloat(region.style.width)) ||
            !near(rect.height, parseFloat(region.style.height))
          )
            return null;
          return { page, pageIndex, rect };
        }),
      );
      if (regionBoxes.some((box) => !box)) return null;

      let lastRegion = -1;
      for (const paragraph of paragraphs) {
        const boxes = layout.getBoxDescriptions(paragraph);
        if (!boxes.length) return null;
        for (const box of boxes) {
          const rect = box.getBorderRect('pt');
          const index = regionBoxes.findIndex(
            (region) =>
              region?.pageIndex === box.pageIndex &&
              contains(region.rect, rect),
          );
          if (index < 0 || index < lastRegion) return null;
          lastRegion = index;
        }
      }
      return regionBoxes[lastRegion]?.page ?? null;
    };

    const lastTextPage = inspect();
    if (lastTextPage === null) return;

    // The open third column can accommodate more text than the standard flow.
    // Remove unused trailing pages, then check the whole layout again.
    const lastPage = Math.max(lastTextPage, imagePage);
    if (lastPage < pages.length - 1) {
      for (const page of pages.splice(lastPage + 1)) page.frame.remove();
      layout.forceRelayout?.();
      if (inspect() !== lastTextPage) return;
    }
    applied = true;
  } finally {
    if (!applied) {
      for (const page of pages.slice(1)) page.frame.remove();
      for (const node of [source, ...pages[0].regions, pictureFrame])
        node.remove();
      for (const node of originalNodes) content.appendChild(node);
      for (const [element, style] of originalStyles) {
        if (style === null) element.removeAttribute('style');
        else element.setAttribute('style', style);
      }
      content.classList.remove(activeClass);
      outerContainer?.classList.remove(pagedClass);
      layout.forceRelayout?.();
    }
  }
}

export default function PDFColumnReadingFlow(layout: ImageLayout): void {
  const candidates = Array.from(
    document.querySelectorAll<HTMLElement>(contentSelector),
  );
  if (!candidates.length) return;

  layout.forceRelayout?.();
  candidates.forEach((content, index) => {
    if (content.classList.contains(activeClass)) return;
    try {
      tryReadingFlow(content, layout, 'srlColumnFlow' + index);
    } catch (error) {
      console.warn(
        'PDF column reading order fell back to standard flow',
        error,
      );
    }
  });
}
