import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path/posix';
import { extractPdfPageRules } from '../../plugins/vitePdfPageRulesPlugin.js';

/** Use exactly the overlay order of the generated PDFreactor configuration. */
export function writePdfOverlayPageRules(pdfDir, cssReferences, targetDir) {
  const rules = cssReferences
    .slice(1)
    .map((reference) =>
      extractPdfPageRules(readFileSync(join(pdfDir, reference), 'utf8')),
    )
    .join('\n');
  const scriptPath = join(targetDir, 'custom.js');
  const existing = existsSync(scriptPath)
    ? readFileSync(scriptPath, 'utf8')
    : '';
  // CSS-only customers may keep custom.js between builds; replace our own header.
  const body = existing.replace(
    /^\/\* SRL PDF overlay page rules \*\/\nwindow\.__srlPDFOverlayPageRules = [^\n]*;\n/,
    '',
  );
  writeFileSync(
    scriptPath,
    `/* SRL PDF overlay page rules */\nwindow.__srlPDFOverlayPageRules = ${JSON.stringify(rules)};\n${body}`,
  );
}
