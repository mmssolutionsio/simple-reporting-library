import { readFile, writeFile, stat } from 'node:fs/promises';
import postcss from 'postcss';

/**
 * Entfernt alle @media-At-Rules aus CSS.
 * Wichtig: bewusst AST-basiert (PostCSS), damit keine False-Positives entstehen.
 */

const normalizeMediaParams = (params) =>
  (params ?? '')
    .trim()
    // Whitespace normalisieren
    .replace(/\s+/g, ' ')
    // rund um Doppelpunkt vereinheitlichen
    .replace(/\s*:\s*/g, ': ')
    // "and" sauber trennen, falls Minifier Leerzeichen frisst
    .replace(/\)\s*and\s*\(/gi, ') and (')
    .replace(/\)and\(/gi, ') and (');

const isPrefersReducedMotionReduce = (params) => {
  const p = normalizeMediaParams(params).toLowerCase();
  return p === '(prefers-reduced-motion: reduce)';
};

/**
 * @typedef {{
 *  params: string,
 *  atRule: import('postcss').AtRule,
 *  fullRuleText: string
 * }} RemoveMediaPayload
 */

/**
 * @typedef {{
 *  onRemoveMedia?: (payload: RemoveMediaPayload) => void,
 *  shouldLogRemovedMedia?: (params: string, atRule: import('postcss').AtRule) => boolean
 * }} RemoveAllMediaPluginOptions
 */

/**
 * @param {RemoveAllMediaPluginOptions} [opts]
 */
const removeAllMediaPlugin = (opts = {}) => {
  const {
    onRemoveMedia = () => {},
    shouldLogRemovedMedia = () => true,
  } = opts;

  return {
    postcssPlugin: 'remove-all-media',
    AtRule: {
      media: (atRule) => {
        const params = atRule.params;

        // erst loggen, dann entfernen
        try {
          if (shouldLogRemovedMedia(params, atRule)) {
            // Wichtig: vor dem remove() stringifizieren, sonst ist der Knoten weg
            const fullRuleText = atRule.toString();
            onRemoveMedia({ params, atRule, fullRuleText });
          }
        } finally {
          atRule.remove();
        }
      },
    },
  };
};
removeAllMediaPlugin.postcss = true;

async function fileExists(path) {
  try {
    const s = await stat(path);
    return s.isFile();
  } catch {
    return false;
  }
}

/**
 * Entfernt @media aus exakt einer CSS-Datei und ersetzt diese Datei durch das Ergebnis.
 * @param {string} cssPath absoluter oder relativer Pfad zur .css Datei
 */
export async function stripMediaFromCssFile(cssPath) {
  const css = await readFile(cssPath, 'utf8');
  const mapPath = `${cssPath}.map`;
  const hasMap = await fileExists(mapPath);

  const prevMap = hasMap ? JSON.parse(await readFile(mapPath, 'utf8')) : false;

  /** @type {string[]} */
  const removedEntries = [];

  const result = await postcss([
    removeAllMediaPlugin({
      shouldLogRemovedMedia: (params) => !isPrefersReducedMotionReduce(params),
      onRemoveMedia: ({ params, fullRuleText }) => {
        const normalized = normalizeMediaParams(params);
        // Eine Zeile pro Eintrag (inkl. Inhalt). Wir hängen den kompletten Block an,
        // aber ohne das doppelte "@media ..." Prefix.
        const body = fullRuleText.replace(/^@media\s+[^{}]+\s*/i, '');
        removedEntries.push(`@media ${normalized} ${body}`);
      },
    }),
  ]).process(css, {
    from: cssPath,
    to: cssPath,
    map: hasMap
      ? {
          inline: false,
          annotation: true,
          prev: prevMap,
        }
      : false,
  });

  await writeFile(cssPath, result.css ?? '', 'utf8');

  if (hasMap && result.map) {
    await writeFile(mapPath, result.map.toString(), 'utf8');
  }

  // Output nur, wenn wirklich etwas entfernt wurde
  if (removedEntries.length > 0) {
    console.log('[strip-media]');
    console.log('');
    for (const line of removedEntries) console.log(line);
    console.log('');
    console.log(`[strip-media] result: removed ${removedEntries.length} @media block(s)`);
  }

  return { file: cssPath, removed: removedEntries.length };
}

// CLI Nutzung: node scripts/stripMediaFromCss.mjs <cssFilePath>
if (import.meta.url === `file://${process.argv[1]}`) {
  const cssFilePath = process.argv[2];
  if (!cssFilePath) {
    console.error('Usage: node scripts/stripMediaFromCss.mjs <cssFilePath>');
    process.exit(1);
  }

  stripMediaFromCssFile(cssFilePath).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
