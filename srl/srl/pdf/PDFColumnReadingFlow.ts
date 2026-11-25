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
  if (frames.length !== 1 || images.length !== 1) return;
  const [frame] = frames;
  const [imageBox] = images;
  if (imageBox.pageIndex !== frame.pageIndex) return;

  const style = window.getComputedStyle(content);
  if (Number(style.getPropertyValue('column-count')) !== 3) return;
  const gap = parseFloat(style.getPropertyValue('column-gap')) * 0.75;
  const area = frame.getContentRect?.('pt') ?? frame.getBorderRect('pt');
  const picture = imageBox.getBorderRect('pt');
  const columnWidth = (area.width - 2 * gap) / 3;
  const step = columnWidth + gap;
  const renderedColumns = new Set<number>();
  for (const paragraph of paragraphs) {
    const boxes = layout.getBoxDescriptions(paragraph);
    if (!boxes.length || boxes.some((box) => box.pageIndex !== frame.pageIndex))
      return;
    for (const box of boxes) {
      const rect = box.getBorderRect('pt');
      const offset = rect.left - area.left;
      const column = Math.round(offset / step);
      if (near(offset, column * step) && column >= 0 && column < 3)
        renderedColumns.add(column);
    }
  }
  if (
    !Number.isFinite(columnWidth) ||
    columnWidth <= 0 ||
    renderedColumns.size !== 3 ||
    !near(picture.left, area.left) ||
    !near(picture.width, 2 * columnWidth + gap)
  )
    return;

  const aboveGap = Math.max(0, picture.top - imageBox.getMarginRect('pt').top);
  const belowGap = Math.max(
    0,
    imageBox.getMarginRect('pt').bottom - picture.bottom,
  );
  const topHeight = picture.top - area.top - aboveGap / 2;
  const bottomY = picture.bottom - area.top + belowGap / 2;
  // Reserve room for more text beside the picture by shortening the lower
  // left and middle regions by two lines when the line height is available.
  const lineHeight =
    parseFloat(
      window.getComputedStyle(paragraphs[0]).getPropertyValue('line-height'),
    ) * 0.75;
  const bottomHeight =
    area.height - bottomY - (Number.isFinite(lineHeight) ? 2 * lineHeight : 0);
  if (topHeight <= 0 || bottomHeight <= 0) return;

  const source = document.createElement('div');
  source.className = 'srl-pdf-column-flow-source';
  const regions = [
    [0, 0, topHeight],
    [0, bottomY, bottomHeight],
    [step, 0, topHeight],
    [step, bottomY, bottomHeight],
    [2 * step, 0, area.height],
  ].map(([x, y, height]) => {
    const region = document.createElement('div');
    region.className = 'srl-pdf-column-flow-region';
    region.style.setProperty('-ro-flow-from', flowName);
    setBox(region, x, y, columnWidth, height);
    return region;
  });
  const pictureFrame = document.createElement('div');
  pictureFrame.className = 'srl-pdf-column-flow-image';
  setBox(pictureFrame, 0, picture.top - area.top, picture.width);

  const originalNodes = Array.from(content.childNodes);
  const originalStyles = [content, ...paragraphs].map(
    (element) => [element, element.getAttribute('style')] as const,
  );
  let applied = false;
  try {
    for (const paragraph of paragraphs) {
      paragraph.style.setProperty('-ro-flow-into', flowName);
      source.appendChild(paragraph);
    }
    pictureFrame.appendChild(image);
    content.classList.add(activeClass);
    content.style.height = points(area.height);
    content.append(source, ...regions, pictureFrame);
    layout.forceRelayout?.();

    const placed = layout.getBoxDescriptions(content);
    const renderedImage = layout.getBoxDescriptions(image)[0];
    const regionBoxes = regions.map(
      (region) => layout.getBoxDescriptions(region)[0],
    );
    applied =
      placed.length === 1 &&
      placed[0].pageIndex === frame.pageIndex &&
      renderedImage?.pageIndex === frame.pageIndex &&
      near(renderedImage.getBorderRect('pt').top, picture.top) &&
      near(renderedImage.getBorderRect('pt').left, picture.left) &&
      near(renderedImage.getBorderRect('pt').bottom, picture.bottom) &&
      regionBoxes.every((box) => box?.pageIndex === frame.pageIndex) &&
      paragraphs.every((paragraph) => {
        const boxes = layout.getBoxDescriptions(paragraph);
        return (
          boxes.length > 0 &&
          boxes.every(
            (box) =>
              box.pageIndex === frame.pageIndex &&
              regionBoxes.some((region) =>
                contains(
                  region.getContentRect?.('pt') ?? region.getBorderRect('pt'),
                  box.getBorderRect('pt'),
                ),
              ),
          )
        );
      });
  } finally {
    if (!applied) {
      for (const node of [source, ...regions, pictureFrame]) node.remove();
      for (const node of originalNodes) content.appendChild(node);
      for (const [element, style] of originalStyles) {
        if (style === null) element.removeAttribute('style');
        else element.setAttribute('style', style);
      }
      content.classList.remove(activeClass);
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
