const Awesomizr = {};

// Data types

/**
 * @typedef {Object} IdValue
 * @property {number} index - The the index.
 * @property {string} prefix - The prefix.
 * @property {string} value - The ID's content.
 *
 * @memberof Awesomizr
 */

// Methods

/**
 * Checks if the element matches a particular selector. This is useful when used in browsers that don't support the standard "matches" function.
 *
 * @param {HTMLElement} ele The element.
 * @param {string} selector The selector.
 * @returns True, if the element matches the given selector, false otherwise.
 */
export function matchesSelector(ele, selector) {
  if (!ele || !(ele instanceof HTMLElement)) {
    throw 'The first parameter must indicate an HTML element';
  }

  if (selector) {
    const matchesList = [
      'matches',
      'webkitMatches',
      'mozMatches',
      'msMatches',
      'oMatches',
      'matchesSelector',
      'webkitMatchesSelector',
      'mozMatchesSelector',
      'msMatchesSelector',
      'oMatchesSelector',
    ];

    for (let i = 0; i < matchesList.length; i++) {
      if (typeof ele[matchesList[i]] == 'function') {
        matchesSelector = function (e, s) {
          return e[matchesList[i]](s);
        };

        return matchesSelector(ele, selector);
      }
    }
  }

  return false;
}

/**
 * Generates the next unused ID by incrementing the start value. If the ID is already in use in the document,
 * The start value is incremented again until an unused ID is found.
 *
 * @param {number} startValue The start value.
 * @param {string} prefix A prefix to use for the ID since IDs starting with numbers are disallowed.
 * @param {string} [suffix] An optional suffix.
 * @returns {IdValue} A currently unused ID value.
 */
export function getNextId(startValue, prefix, suffix) {
  if (
    startValue === undefined ||
    (typeof startValue).toLowerCase() != 'number'
  ) {
    startValue = 0;
  }

  if (
    prefix === undefined ||
    (typeof prefix).toLowerCase() != 'string' ||
    !prefix
  ) {
    prefix = 'ro-id';
  }

  if (suffix === undefined || (typeof suffix).toLowerCase() != 'string') {
    suffix = '';
  }

  let index = startValue;

  while (document.getElementById(prefix + index + suffix)) {
    index++;
  }

  return { index: index, prefix: prefix, value: prefix + index + suffix };
}

/**
 * This function transforms and rotates a table header, in order to reduce its width. If there is no table header, the first line is converted to one.
 *
 * @param {HTMLTableElement} table The HTML node of the table.
 * @param {object} [params] An object of optional parameters.
 * @param {number} [params.angle=45] The angle in degrees at which the header will be rotated. Must be between -90 and 90 (exclusive).
 * @param {string} [params.width="auto"] The width that the header cells should have after the transformation, e.g. "20pt".
 * @param {boolean} [params.firstCol=false] Whether to prevent the first column from being transformed.
 * @param {boolean} [params.lastCol=false] Whether to prevent the last column from being transformed.
 * @param {boolean} [params.footer=false] Whether to create a "tfoot" element from the last row in the table. Has no effect if the table already contains a "tfoot".
 */
export function rotateTableHeader(
  table,
  {
    angle = 45,
    width = 'auto',
    firstCol = false,
    lastCol = false,
    footer = false,
  } = {},
) {
  if (!table) {
    throw 'An HTML table element must be specified.';
  }

  // normalize the angle
  while (angle > 90) {
    angle = angle - 180;
  }

  while (angle < -90) {
    angle = 180 + angle;
  }

  // if the angle is exactly -90 or 90, we do nothing since that can't be displayed properly
  if (angle == 90 || angle == -90) {
    return;
  }

  let elems,
    maxWidth = 0,
    startCol = 0,
    endCol = 0;

  if (firstCol) {
    startCol = 1;
  }

  if (lastCol) {
    endCol = -1;
  }

  table.classList.add('awesomizr-table-table');

  elems = table.querySelectorAll('thead td, thead th');

  let hasNoTHead = elems.length == 0;
  let needsTFoot = footer;

  // if we dont have a thead then create one from the first row
  // also create a tfoot when necessary from the last row
  if (
    hasNoTHead ||
    (needsTFoot = footer && table.querySelectorAll('tfoot td').length == 0)
  ) {
    let firstRow = table.querySelector('tr');

    if (!firstRow) {
      return;
    }

    // Build a new valid table with thead, tbody and optional tfoot
    let thead = document.createElement('thead'),
      tbody = document.createElement('tbody'),
      tfoot = document.createElement('tfoot');

    let rows;

    // get the rows of the body
    if (hasNoTHead) {
      rows = firstRow.parentNode.children;
    } else {
      // rows inside tbody
      rows = table.querySelectorAll('tbody > tr');
      if (rows.lenght == 0) {
        // rows might be direct children of table
        let hadId = true;
        if (!table.id) {
          hadID = false;
          table.id = 'awesomizr-table-no-tbody-helper-id';
        }

        rows = table.parentNode.querySelectorAll('#' + table.id + ' > tr');

        if (!hadId) {
          table.id = '';
        }
      }
    }

    let length = rows.length;

    if (hasNoTHead) {
      // use first row as head
      thead.appendChild(firstRow.cloneNode(true));
    } else {
      // continue to use thead
      thead = table.querySelector('thead').cloneNode(true);
    }
    if (footer && needsTFoot && length > 0) {
      // use the last row as tfoot
      tfoot.appendChild(rows[--length].cloneNode(true));
    }

    // use the remaining rows for tbody
    for (let i = hasNoTHead ? 1 : 0; i < length; i++) {
      tbody.appendChild(rows[i].cloneNode(true));
    }
    table.innerHTML = '';

    table.appendChild(thead);
    table.appendChild(tbody);
    table.appendChild(tfoot);
    elems = table.querySelectorAll('thead td, thead th');
  }

  for (let i = 0; i < elems.length; i++) {
    elems[i].innerHTML = '<div>' + elems[i].innerHTML + '</div>';
    elems[i].firstElementChild.style.overflow = 'visible';
    elems[i].firstElementChild.style.whiteSpace = 'nowrap';
    elems[i].style.verticalAlign = 'bottom';
    elems[i].style.transformOrigin = '50% 100%';

    if (i >= startCol && i < elems.length + endCol) {
      elems[i].style.textAlign = 'center';
      elems[i].style.width = width;

      // some styles to extract the width
      elems[i].firstElementChild.style.position = 'absolute';
      elems[i].firstElementChild.style['float'] = 'left';
      elems[i].firstElementChild.style.maxWidth = 'none';

      let curWidth = elems[i].firstElementChild.clientWidth;
      maxWidth = Math.max(maxWidth, curWidth);

      // style back
      elems[i].firstElementChild.style.maxWidth = '0pt';
      elems[i].firstElementChild.style.position = 'static';
      elems[i].firstElementChild.style['float'] = 'none';
      elems[i].firstElementChild.style.marginLeft = '50%';

      // flip the direction of the text if the angle is less than 0
      if (angle < 0 || angle >= 180) {
        elems[i].firstElementChild.style.transform =
          'translateX(' + -curWidth + 'px)';
      }

      elems[i].style.transform = 'skewX(' + -angle + 'deg)';
    }
  }

  maxWidth = maxWidth * 1.5;
  table.querySelector('thead tr').style.height =
    maxWidth * Math.abs(Math.cos((angle / 180) * Math.PI)) + 'px';
  elems = table.querySelectorAll('thead td > div, thead th > div');

  for (let i = startCol; i < elems.length + endCol; i++) {
    let rotation = angle - 90;

    if (angle < 0 || angle > 180) {
      rotation = angle - 270;
    }

    elems[i].style.transform =
      'skewX(' + angle + 'deg) rotate(' + rotation + 'deg)';
  }

  // if we have a special first column and/or last column
  let specialCols = [];

  if (startCol > 0) specialCols.push(0);
  if (endCol < 0) specialCols.push(elems.length - 1);

  if (specialCols.length > 0) {
    for (let i = 0; i < specialCols.length; i++) {
      elems[specialCols[i]].parentNode.className =
        specialCols[i] === 0
          ? 'awesomizr-table-first-column'
          : 'awesomizr-table-last-column';
      elems[specialCols[i]].style.width = 'auto';
    }
  }
}

/**
 * This function allows to insert a table of contents that is generated from given elements.
 * The table of contents requires certain styles to work properly. These styles are included in the awesomizr.css
 * and should be added either to the document or by using the userStyleSheets configuration property of the PDFreactor API.
 * The table of contents is inserted as an HTML div element with the class "ro-toc". Inside this div can be two headings
 * (document title and a heading for the table of contents with the class "ro-toc-heading") and the div elements with links to the pages and a class depending on the level of the referenced element ("ro-toc-heading1", "ro-toc-heading2", ...)
 * The level of a TOC entry is determined by the position of its selector in the elements array.
 *
 * @param {object} [params] The function's optional parameter is an object with several options.
 * @param {string} [params.insertiontarget="body"] CSS selector string of the element where the table of contents should be inserted.
 * @param { "afterbegin" | "afterend" | "beforebegin" | "beforeend" } [params.insertiontype="afterbegin"] Specifies where exactly the table of contents should be inserted:
 * * "beforebegin": Before the element
 * * "afterbegin": As new first-child
 * * "beforeend": As new last-child
 * * "afterend": After the element
 * @param {string[]} [params.elements=["h1", "h2"]] An array of the CSS selector strings of elements that should be added to the table of contents.
 * The index in the array represents the level, i.e index 0 represents level 1, index 1 represents level 2, etc.
 * Each TOC entry gets a class name based on the level, e.g. by default the "h2" entries have the class "ro-toc-level-2".
 * @param {string} [params.toctitle="Table of Contents"] The title of the table of contents. If an empty string is set, no title is inserted.
 * @param {boolean} [params.disabledocumenttitle=false] Whether the document title should NOT be inserted before the table of contents.
 * @param {function} [params.text] By default, the text for the entries of the TOC is the text content of the element matching the specified selector.
 * Alternatively, you can specify a function, the return value of which will be used as text for the respective entry.
 * The element representing the entry is passed as an argument to the function. Returning "false" will skip the entry entirely and not include it in the TOC.
 */
export function createTableOfContents({
  insertiontarget = 'body',
  insertiontype = 'afterbegin',
  elements = ['h1', 'h2'],
  toctitle = 'Table of Contents',
  disabledocumenttitle = false,
  text = null,
  accessible = false,
} = {}) {
  let toc = '';

  const tocHeadingClass = 'ro-toc-heading';
  const tocClass = 'ro-toc';
  const tocAccClass = 'ro-toc-acc';

  // Check whether the elements parameter is a string instead of an array
  if ((typeof elements).toLowerCase() == 'string') {
    elements = [elements];
  }

  // Get an selector for all heading elements that should be added to the toc
  let selector = elements[0];
  for (let i = 1; i < elements.length; i++) {
    selector += ', ' + elements[i];
  }

  // Create the TOC HTML
  let elementNodes = document.querySelectorAll(selector);
  let idNumber = 0;
  for (let i = 0; i < elementNodes.length; i++) {
    let ele = elementNodes[i];
    let id = ele.id;
    let textContent = null;

    if ((typeof text).toLowerCase() === 'function') {
      textContent = text(ele);

      if (textContent === false) {
        continue;
      } else if (textContent === true) {
        textContent = null;
      } else {
        textContent += '';
      }
    }

    if (textContent === null) {
      textContent = ele.textContent;
    }

    if (!id) {
      let nextId = getNextId(idNumber, 'ro-toc-heading');

      idNumber = nextId.index;
      id = nextId.value;

      ele.id = id;
    }
    let tocLevel = 0;
    for (let k = 0; k < elements.length; k++) {
      if (matchesSelector(ele, elements[k])) {
        tocLevel = k + 1;
        break;
      }
    }

    // Add line to TOC HTML
    toc += '<div class="ro-toc-level-' + tocLevel + '">';
    if (accessible) {
      toc += '<div>';
    }
    toc +=
      '<a href="#' +
      id +
      '">' +
      textContent.replace('&', '&amp;').replace('<', '&lt;') +
      '</a></div>';
    if (accessible) {
      toc += '</div>';
    }
  }

  // Prepare to wrap TOC HTML into container
  let tocContainer =
    '<div class="' + tocClass + (accessible ? ' ' + tocAccClass : '') + '">';

  if (!disabledocumenttitle) {
    // Add the document title as a heading
    tocContainer += '<h1>' + document.title + '</h1>';
  }

  // Only insert a heading for the toc if it has not been set to empty string
  if (toctitle.length > 0) {
    tocContainer += '<h2 class="' + tocHeadingClass + '">' + toctitle + '</h2>';
  }

  if (accessible) {
    tocContainer += '<div>';
  }
  tocContainer += toc + '</div>';
  if (accessible) {
    tocContainer += '</div>';
  }

  // Insert TOC HTML before the content of target (body by default)
  document
    .querySelector(insertiontarget)
    .insertAdjacentHTML(insertiontype, tocContainer);
}

/**
 * Automatically adds page breaks depending on the amount of space left below an element.
 * A possible use case is to prevent a new section from beginning at the bottom of a page.
 * The function also prevents large whitespaces that occur when in situations where only a couple of sentences from a previous section are followed by a page break as the next section begins.
 *
 * @param {string} [selector="h1, h2"] The CSS selector for the elements that may require a new page break.
 * @param {number} [threshold=67] If an element is below this percentage of the page height, a page break is inserted.
 */
export function applyAdaptivePageBreaks(selector = 'h1, h2', threshold = 67) {
  // Check whether the required JS API exists
  if (window.ro === undefined || window.ro.layout === undefined) {
    return;
  }

  // If the threshold is a string (e.g. "50%") convert it to a 0-100 value.
  if ((typeof threshold).toLowerCase() == 'string') {
    threshold = Math.max(Math.min(parseInt(threshold), 100), 0);
  }

  // 50% -> 0.5
  threshold = threshold / 100;

  // Iterate over the selected elements
  let elements = document.querySelectorAll(selector);
  for (let i = 0; i < elements.length; i++) {
    let element = elements[i];
    let boxDescList;
    let compStyle;
    let compDisplayStyle;
    // if necessary move up until we find an element that is not inline, has at least one box and is not the body or root element
    while (
      element &&
      (element == document ||
        element == document.documentElement ||
        element == document.body ||
        !(compStyle = window.getComputedStyle(element)) ||
        !(compDisplayStyle = compStyle.display) ||
        compDisplayStyle == 'inline' ||
        compDisplayStyle == 'none' ||
        compDisplayStyle == 'table-cell' ||
        !(boxDescList = ro.layout.getBoxDescriptions(element)) ||
        boxDescList.length == 0)
    ) {
      element = element.parentNode;
    }
    if (element) {
      let boxDesc = boxDescList[0];
      let boxRect = boxDesc.borderRectInPage;
      let pageMarginRect = boxDesc.pageDescription.marginRect;
      // Check whether the box starts below the threshold value
      if (boxRect.top > pageMarginRect.height * threshold) {
        // Add a page break
        element.style.breakBefore = 'page';
      }
    }
  }
}

/**
 * Automatically fills up the document with empty pages until
 * the total page count is a multiple of the specified value.
 * The filler Pages have the name "roFillerPage" and the elements have the class "roFillerPage".
 *
 * @param {object} [params] An object containing various configuration properties.
 * @param {number} [params.multiple=2] A positive integer. Pages will be filled up until the page count is a multiple of this property.
 * @param {string} [params.target="body"] A selector. The filler page objects will be inserted as new children of the element matching this selector.
 * @param {function} [params.template] A function that must return an HTMLElement which will be used as the filler pages. Returning null or undefined skips the page.
 * If no function is specified, a custom element is inserted. The function receives the following three arguments: The current index of the inserted filler page (starting at 0),
 * the total number of filler pages to be inserted, the total (original) page count of the document.
 */
export function autoFillPages({
  multiple = 2,
  target = 'body',
  template = null,
} = {}) {
  // Check whether the required JS API exists
  if (window.ro === undefined || window.ro.layout === undefined) {
    return;
  }

  const roFillerPage = 'roFillerPage';

  const currentPageCount = ro.layout.numberOfPages;
  let pagesToInsert = 0;

  // How many pages do we need?
  const pageMod = parseInt(multiple);

  if (!Number.isNaN(pageMod) && pageMod > 0) {
    const currentPageMod = currentPageCount % pageMod;

    if (currentPageMod) {
      pagesToInsert = pageMod - (currentPageCount % pageMod);
    }
  } else {
    throw "Param 'multiple' must be positive integer.";
  }

  console.debug('[Awesomizr] Inserting ' + pagesToInsert + ' pages');

  // Begin inserting pages
  if (pagesToInsert > 0) {
    const targetElement = document.querySelector(target);

    if (!targetElement) {
      throw "Insertion target not found from param 'target'.";
    }

    for (let i = 0; i < pagesToInsert; i++) {
      let fillerPage = null;

      if (template) {
        if (template instanceof Function) {
          fillerPage = template(i, pagesToInsert, currentPageCount);

          if (fillerPage === null || fillerPage === undefined) {
            continue;
          }

          if (!(fillerPage instanceof HTMLElement)) {
            throw "Param function 'template' must return an HTMLElement.";
          }
        } else {
          throw "Param 'template' must be a function.";
        }
      } else {
        fillerPage = document.createElement(roFillerPage);
      }

      // Always add class and some basic styles
      fillerPage.className = roFillerPage;
      fillerPage.style.page = roFillerPage;
      fillerPage.style.display = 'block';
      fillerPage.style.breakBefore = 'page';

      targetElement.appendChild(fillerPage);
    }
  }
}

/**
 * Converts a wide data table into a compact, vertical layout that displays each cell below the previous one.
 * Column headers are automatically repeated for each data set and are displayed on the left side next to the data.
 * Note that this only works for uniform data tables without any colspan, rowspan, or special row groups.
 *
 * The compactified table element will receive the class "awesomizr-compact-table", and the repeated column headers
 * will recieve the class "awesomizr-compact-table-header-cell".
 *
 * @param {HTMLTableElement} table The HTML table element to convert.
 * @param {object} [params] An object containing various configuration properties.
 * @param {string[]} [params.widths=["fit-content(50%)", "auto"]] An array with two entries, each specifying the width of one of the two display columns. The values must be a CSS length.
 * @param {boolean} [params.autoDetectOverflow=false] Whether to automatically detect if a table's width overflows the page. If not, the table is not converted.
 */
export function compactifyTable(
  table,
  { widths = ['fit-content(50%)', 'auto'], autoDetectOverflow = false } = {},
) {
  if (!Array.isArray(widths) || widths.length != 2) {
    throw "Param 'widths' must be an array with length 2.";
  }

  const thead = table.querySelector('thead');

  if (thead == null) {
    throw 'Table must have a thead element.';
  }

  if (autoDetectOverflow && window.ro && window.ro.layout) {
    // Get width of table
    const boxDescriptions = ro.layout.getBoxDescriptions(table);

    for (const boxDescription of boxDescriptions) {
      const pageDescription = boxDescription.pageDescription;
      const pageContentWidth = pageDescription.getContentRect().width;
      const tableWidth = boxDescription.getMarginRect().width;

      if (tableWidth <= pageContentWidth) {
        return;
      }
    }
  }

  const columnHeaders = thead.querySelectorAll(
    'thead > tr:first-child > :is(td, th)',
  );
  const rows = table.querySelectorAll('tbody tr');

  const classTable = 'awesomizr-compact-table';
  const classHeaderCell = 'awesomizr-compact-table-header-cell';

  table.classList.add(classTable);

  for (const cell of [
    ...columnHeaders,
    ...thead.querySelectorAll('tfoot > tr:first-child > :is(td, th)'),
  ]) {
    cell.setAttribute('data-awesomizr-content', cell.textContent);
  }

  for (const row of rows) {
    const cells = row.querySelectorAll(':scope > :is(td, th)');

    row.style.display = 'grid';
    row.style.gridTemplateColumns = widths.join(' ');

    let index = 0;
    for (const cell of cells) {
      const columnHeader = columnHeaders[index];
      const headerCell = document.createElement(columnHeader.nodeName);

      headerCell.classList.add(classHeaderCell);
      headerCell.innerHTML = columnHeader.innerHTML;

      row.insertBefore(headerCell, cell);

      index++;
    }
  }
}

/**
 * This is a helper function to dynamically load MathJax with a configuration. If the configuration
 * parameter is omitted, a default configuration is used which is optimized for PDFreactor.
 *
 * @param {string} url The url to the MaxJax library. If the URL is relative, it is resolved against the document URL.
 * @param {object|string} [configuration] A MathJax configuration. Can be an object or a string. As string,
 * it represents one of the combined configurations offered by MathJax.
 */
export function loadMathJax(url, configuration) {
  if (!configuration) {
    /* This configuration is optimized for PDFreactor and omits certain
     * extensions and features typically used in browsers that rely
     * on animations or user interactivity.
     */
    configuration = {
      showMathMenu: false,
      jax: ['input/MathML', 'output/SVG'],
      extensions: ['mml2jax.js'],
      MathML: { extensions: ['content-mathml.js'] },
      SVG: { blacker: 0 },
    };
  }

  const script = document.createElement('script');
  const scriptUrl = new URL(url, window.location.href);

  if (typeof configuration === 'object') {
    // For configuration objects, use a script
    const configScript = document.createElement('script');
    configScript.type = 'text/x-mathjax-config';
    configScript.textContent = `MathJax.Hub.Config(${JSON.stringify(configuration)});`;

    document.head.appendChild(configScript);
  } else {
    scriptUrl.searchParams.set('config', configuration);
  }

  script.src = scriptUrl.href;

  document.head.appendChild(script);
}
