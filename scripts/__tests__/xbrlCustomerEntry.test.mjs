import { expect, test } from '@jest/globals';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  customerDeclaresFonts,
  customerXbrlBaseEntry,
  withoutProjectTextFonts,
} from '../css/xbrlCustomerEntry.js';

const xbrlImports = [
  '@use "../../srl/config" as *;',
  '@use "@simple-reporting/base/scss/init-root.scss" as *;',
  '@use "../../src/assets/fonts/Inter/inter.scss" as *;',
  '@use "../../src/assets/fonts/FontAwesome/font.scss" as *;',
  '@use "../../src/assets/scss/xbrl.scss" as *;',
  '@use "@simple-reporting/base/scss/xbrl-core-styles.scss" as *;',
].join('\n');

async function withCustomer(files, run) {
  const dir = await mkdtemp(join(tmpdir(), 'srl-xbrl-customer-'));
  try {
    for (const [name, content] of Object.entries(files)) {
      await mkdir(join(dir, name, '..'), { recursive: true });
      await writeFile(join(dir, name), content);
    }
    return await run(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test('removes project text fonts but keeps FontAwesome and everything else', () => {
  const result = withoutProjectTextFonts(xbrlImports);
  expect(result).not.toContain('Inter/inter.scss');
  expect(result).toContain('FontAwesome/font.scss');
  expect(result).toContain('src/assets/scss/xbrl.scss');
  expect(result).toContain('xbrl-core-styles.scss');
});

test('detects @font-face in nested customer scss files', () =>
  withCustomer(
    {
      'custom.scss': "@use 'scss/fonts';",
      'scss/fonts.scss':
        '@font-face { font-family: X; src: url(./fonts/x.woff2); }',
    },
    (dir) => expect(customerDeclaresFonts(dir)).toBe(true),
  ));

test('ignores customers without fonts and commented-out @font-face', () =>
  withCustomer(
    {
      'custom.scss':
        '// @font-face { font-family: X; }\n/* @font-face {} */\n.a { color: red; }',
    },
    (dir) => expect(customerDeclaresFonts(dir)).toBe(false),
  ));

test('uses the full xbrl.scss when the customer has no fonts', () =>
  withCustomer({ 'custom.scss': '.a { color: red; }' }, async (dir) => {
    await writeFile(join(dir, 'xbrl.scss'), xbrlImports);
    expect(customerXbrlBaseEntry(dir, dir)).toBe(join(dir, 'xbrl.scss'));
  }));

test('writes xbrl-customer.scss without project text fonts when the customer has fonts', () =>
  withCustomer(
    { 'custom.scss': '@font-face { font-family: X; }' },
    async (dir) => {
      await writeFile(join(dir, 'xbrl.scss'), xbrlImports);
      const entry = customerXbrlBaseEntry(dir, dir);
      expect(entry).toBe(join(dir, 'xbrl-customer.scss'));
      const content = await readFile(entry, 'utf8');
      expect(content).not.toContain('Inter');
      expect(content).toContain('FontAwesome');
    },
  ));
