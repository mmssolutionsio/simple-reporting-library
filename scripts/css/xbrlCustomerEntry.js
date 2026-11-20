import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path/posix';
import { globSync } from 'glob';

/** Icon fonts stay in the customer XBRL even when the customer brings its own text fonts. */
const KEPT_PROJECT_FONTS = /\/src\/assets\/fonts\/FontAwesome\//i;
const PROJECT_FONTS = /\/src\/assets\/fonts\//;

function stripComments(scss) {
  return scss
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

/**
 * Whether a customer overlay declares its own fonts (an @font-face in any of its SCSS/CSS files).
 *
 * @param {string} customerDir - pdf/customers/<customer>
 * @returns {boolean}
 */
export function customerDeclaresFonts(customerDir) {
  const files = globSync('**/*.{scss,css}', {
    cwd: customerDir,
    absolute: true,
    posix: true,
    ignore: ['node_modules/**'],
  });
  return files.some((file) =>
    /@font-face\b/.test(stripComments(readFileSync(file, 'utf8'))),
  );
}

/**
 * Removes the project text fonts (src/assets/fonts/**, e.g. Inter) from the generated
 * xbrl.scss import list. Icon fonts (FontAwesome) are kept.
 *
 * @param {string} xbrlImports - content of .srl/imports/xbrl.scss
 * @returns {string}
 */
export function withoutProjectTextFonts(xbrlImports) {
  return xbrlImports
    .split('\n')
    .filter(
      (line) => !PROJECT_FONTS.test(line) || KEPT_PROJECT_FONTS.test(line),
    )
    .join('\n');
}

/**
 * Returns the base entry for a customer XBRL build. The XBRL stylesheet embeds all fonts
 * as base64, so when the customer declares its own fonts the project text fonts are left out
 * to keep the file small.
 *
 * @param {string} importsDir - .srl/imports
 * @param {string} customerDir - pdf/customers/<customer>
 * @returns {string} path of the SCSS entry to build
 */
export function customerXbrlBaseEntry(importsDir, customerDir) {
  const baseEntry = join(importsDir, 'xbrl.scss');
  if (!customerDeclaresFonts(customerDir)) {
    return baseEntry;
  }
  const entry = join(importsDir, 'xbrl-customer.scss');
  writeFileSync(
    entry,
    withoutProjectTextFonts(readFileSync(baseEntry, 'utf8')),
  );
  return entry;
}
