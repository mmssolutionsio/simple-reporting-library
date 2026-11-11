import { describe, it, expect, jest, beforeAll, afterAll } from '@jest/globals';
import * as actualFs from 'node:fs';
import * as actualGlob from 'glob';
import { tmpdir } from 'node:os';
import { join } from 'node:path/posix';

/**
 * mapLdd() builds livingdocs.config.json from readdirSync() / glob() results,
 * whose order depends on the filesystem. These tests feed it the same fixture
 * once in natural and once in reversed order and expect identical, sorted
 * output.
 */

const root = actualFs.mkdtempSync(join(tmpdir(), 'srl-mapLdd-'));
const ld = join(root, 'livingdocs');
const srlPlugins = join(root, '.srl', 'plugins');

let reverse = false;
let lddJson;

const maybeReverse = (list) => (reverse ? [...list].reverse() : list);

jest.unstable_mockModule('node:fs', () => ({
  ...actualFs,
  readdirSync: (...args) => maybeReverse(actualFs.readdirSync(...args)),
}));

jest.unstable_mockModule('glob', () => ({
  ...actualGlob,
  glob: async (...args) => maybeReverse(await actualGlob.glob(...args)),
  globSync: (...args) => maybeReverse(actualGlob.globSync(...args)),
}));

jest.unstable_mockModule('vite', () => ({
  createLogger: () => ({ error: () => {}, info: () => {}, warn: () => {} }),
}));

jest.unstable_mockModule('../../folders.js', () => ({
  default: { root, ld, srlPlugins },
}));

jest.unstable_mockModule('../../utils.js', () => ({
  lddGroupNames: (name) => name.split('.').slice(1).join('.') || name,
  readLivingDocsJson: async () => {
    lddJson = { name: 'test-design' };
    return lddJson;
  },
  writeLivingDocsJson: async () => true,
}));

const { mapLdd } = await import('../mapLdd.js');

function writeFile(path, content) {
  actualFs.mkdirSync(path.substring(0, path.lastIndexOf('/')), {
    recursive: true,
  });
  actualFs.writeFileSync(path, content);
}

function component(group, folder, name, { vue, properties } = {}) {
  const dir = join(ld, group, folder);
  writeFile(join(dir, 'ld-conf.json'), JSON.stringify({ name }));
  writeFile(join(dir, `${name}.html`), `<div>\n  ${name}\n</div>`);
  if (vue) writeFile(join(dir, `${name}.vue`), '<template></template>');
  if (properties) {
    writeFile(join(dir, 'properties.json'), JSON.stringify(properties));
  }
}

async function run(reversed) {
  reverse = reversed;
  await mapLdd();
  const asyncComponents = actualFs.readFileSync(
    join(srlPlugins, 'asyncLdComponent.ts'),
    'utf-8',
  );
  return { json: JSON.stringify(lddJson, null, 2), lddJson, asyncComponents };
}

beforeAll(() => {
  actualFs.mkdirSync(srlPlugins, { recursive: true });

  component('010.Titles', '010.title-h1', 'title-h1', {
    properties: { 'h1-as': { v: 1 }, shared: { v: 'title-h1' } },
  });
  component('010.Titles', '020.title-h2', 'title-h2', { vue: true });
  component('020.Text', '010.paragraph', 'paragraph', { vue: true });
  component('020.Text', '020.quote', 'quote');

  writeFile(
    join(ld, '999.Properties', 'alignment', 'properties.json'),
    JSON.stringify({ alignment: { v: 1 } }),
  );
  writeFile(
    join(ld, '999.Properties', 'color', 'properties.json'),
    JSON.stringify({ color: { v: 1 }, shared: { v: 'color' } }),
  );
});

afterAll(() => {
  actualFs.rmSync(root, { recursive: true, force: true });
});

describe('mapLdd deterministic output', () => {
  it('produces identical output regardless of filesystem order', async () => {
    const natural = await run(false);
    const reversed = await run(true);

    expect(reversed.json).toBe(natural.json);
    expect(reversed.asyncComponents).toBe(natural.asyncComponents);
  });

  it('sorts groups and their components by folder name', async () => {
    const { lddJson } = await run(true);

    expect(lddJson.groups).toEqual([
      { label: 'Titles', components: ['title-h1', 'title-h2'] },
      { label: 'Text', components: ['paragraph', 'quote'] },
      { label: 'Properties', components: [] },
    ]);
  });

  it('sorts component declarations by group and component folder', async () => {
    const { lddJson } = await run(true);

    expect(lddJson.components.map((c) => c.name)).toEqual([
      'title-h1',
      'title-h2',
      'paragraph',
      'quote',
    ]);
  });

  it('merges componentProperties in sorted file order', async () => {
    const { lddJson } = await run(true);

    expect(Object.keys(lddJson.componentProperties)).toEqual([
      'h1-as',
      'shared',
      'alignment',
      'color',
    ]);
    // the later file (by sorted path) wins on duplicate keys
    expect(lddJson.componentProperties.shared).toEqual({ v: 'color' });
  });

  it('registers async vue components in sorted order', async () => {
    const { asyncComponents } = await run(true);

    const names = [...asyncComponents.matchAll(/app\.component\('(\w+)'/g)].map(
      (m) => m[1],
    );
    expect(names).toEqual(['SrlLdTitleH2', 'SrlLdParagraph']);
  });
});
