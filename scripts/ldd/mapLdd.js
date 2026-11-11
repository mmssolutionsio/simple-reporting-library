import { join } from 'node:path/posix';
import { glob, globSync } from 'glob';
import { createRequire } from 'node:module';
import folders from '../folders.js';
import {
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import {
  lddGroupNames,
  readLivingDocsJson,
  writeLivingDocsJson,
} from '../utils.js';
import { createLogger } from 'vite';

const logger = createLogger();
const require = createRequire(import.meta.url);

/**
 * Deterministic, locale-independent string comparison (by UTF-16 code units).
 * readdirSync() and glob() return entries in filesystem-dependent order, which
 * makes the generated livingdocs.config.json change between machines/runs.
 * Zero-padded numeric prefixes (e.g. `010.Titles`) sort correctly with this.
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function compareNames(a, b) {
  // normalize Windows separators so the order is identical on every OS
  a = a.replaceAll('\\', '/');
  b = b.replaceAll('\\', '/');
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Returns a sorted copy of a list of file / folder names or paths.
 * @param {string[]} list
 * @returns {string[]}
 */
function sorted(list) {
  return [...list].sort(compareNames);
}

export async function mapLdd() {
  const lddJson = await readLivingDocsJson();

  await mapGroups(lddJson);
  await mapComponents(lddJson);
  await mapProperties(lddJson);

  await writeLivingDocsJson();
}

/**
 * map all properties.{json,js,ts} declarations
 * @returns {Promise<void>}
 */
async function mapProperties(lddJson) {
  const propertiesFiles = sorted(
    await glob(join(folders.ld, '**', 'properties.{json,js,ts}')),
  );
  const mapProperties = {};

  for (let i = 0; i < propertiesFiles.length; i++) {
    const file = propertiesFiles[i];
    if (file.endsWith('.js') || file.endsWith('.ts')) {
      const properties = require(propertiesFiles[i]).default;
      const oKeys = Object.keys(properties);

      for (let j = 0; j < oKeys.length; j++) {
        mapProperties[oKeys[j]] = properties[oKeys[j]];
      }
    } else if (file.endsWith('.json')) {
      const properties = JSON.parse(readFileSync(propertiesFiles[i]));
      const oKeys = Object.keys(properties);
      for (let j = 0; j < oKeys.length; j++) {
        mapProperties[oKeys[j]] = properties[oKeys[j]];
      }
    }
  }

  lddJson.componentProperties = mapProperties;
}

/**
 * map group / component folder structure to design configuration
 * @param {*} lddJson
 * @returns
 */
async function mapGroups(lddJson) {
  const groupsPath = folders.ld;
  const groups = sorted(readdirSync(groupsPath));

  lddJson.groups = [];

  for (let x = 0; x < groups.length; x++) {
    const group = groups[x];
    const groupName = lddGroupNames(group);

    try {
      const groupFolderPath = join(groupsPath, group);
      const stat = statSync(groupFolderPath);

      if (stat.isDirectory()) {
        const components = getGroupComponents(groupFolderPath);
          lddJson.groups.push({
            label: groupName,
            components: components,
          });
      } else {
        rmSync(groupFolderPath);
      }
    } catch (error) {
      logger.error(error);
      return false;
    }
  }
}

/**
 * load and map all ld-conf.json + component.html to component configuration
 * @param {path} groupFolderPath
 * @returns {string[]}
 */
function getGroupComponents(groupFolderPath) {
  const componentFolders = sorted(readdirSync(groupFolderPath));
  const components = [];

  for (let j = 0; j < componentFolders.length; j++) {
    const component = componentFolders[j];

    try {
      const htmlPath = sorted(
        globSync(join(groupFolderPath, component, `*.html`)),
      );
      const ldConfPath = join(groupFolderPath, component, `ld-conf.json`);

      const htmlStat = statSync(htmlPath[0]);
      const ldConfStat = statSync(ldConfPath);

      const arrComponent = component.split('.');
      if (arrComponent.length > 1) {
        arrComponent.shift()
      }
      components.push(arrComponent.join('.'));
    } catch (e) {}
  }

  return components;
}

async function mapComponents(lddJson) {
  const groupsPath = folders.ld;
  const groups = sorted(readdirSync(groupsPath));

  const lddComponents = [];
  const vueComponents = [];

  for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
    const group = groups[groupIndex];

    const groupPath = join(groupsPath, group);
    const components = sorted(readdirSync(groupPath));

    components.forEach((component) => {
      // ldd static component
      try {
        const htmlFile = sorted(
          globSync(join(groupPath, component, '*.html'), { posix: true }),
        );
        if (htmlFile.length) {
          const htmlPath = htmlFile[0];
          const ldConfPath = join(groupPath, component, `ld-conf.json`);
          const ldConfStat = statSync(ldConfPath);

          const componentDeclaration = JSON.parse(
            readFileSync(ldConfPath, { encoding: 'utf-8' }),
          );
          const componentHtml = readFileSync(htmlPath, { encoding: 'utf-8' });

          lddComponents.push({ 
            ...componentDeclaration, 
            html: componentHtml
                    .replaceAll(/>\s+/g, ">")
                    .replaceAll(/\s+</g, "<")
                    .trim()
          });
        }
      } catch (error) {}

      //   vue async component
      try {
        const vueFiles = sorted(
          globSync(join(groupPath, component, '*.vue'), { posix: true }),
        );
        if (vueFiles.length) {
          vueFiles.forEach( c => {
            const vueFile = c.split('/').pop();
            const vueName = toUpperCamelCase(vueFile.substring(0, vueFile.length - 4));
            vueComponents.push({
              name: `SrlLd${vueName}`,
              path: join('#ld', group, component, vueFile),
            });
          })
        }
      } catch (error) {}
    });
  }

  // write ldd components
  lddJson.components = lddComponents;

  // write async components
  const asyncComponents = [
    `import { defineAsyncComponent, type App } from 'vue'`,
    `export default function asyncLdComponent(app: App): void {`,
  ];

  for (let i = 0; i < vueComponents.length; i++) {
    const component = vueComponents[i];
    asyncComponents.push(
      ` app.component('${component.name}', defineAsyncComponent(() => import('${component.path}')))`,
    );
  }

  asyncComponents.push('}');

  writeFileSync(
    join(folders.srlPlugins, 'asyncLdComponent.ts'),
    asyncComponents.join('\n'),
  );
}

function toUpperCamelCase(input) {
  return input
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}
