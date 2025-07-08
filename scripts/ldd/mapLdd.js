import { join } from 'node:path/posix';
import { glob } from 'glob';
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

export async function mapLdd() {
  const lddJson = await readLivingDocsJson();

  await mapGroups(lddJson);
  await mapComponents(lddJson);
  await mapProperties(lddJson);

  await writeLivingDocsJson(lddJson);
}

/**
 * map all properties.{json,js,ts} declarations
 * @returns {Promise<void>}
 */
async function mapProperties(lddJson) {
  const propertiesFiles = await glob(
    join(folders.ld, '**', 'properties.{json,js,ts}'),
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
  const groups = readdirSync(groupsPath);
  const keepGroups = [];

  for (let x = 0; x < groups.length; x++) {
    const group = groups[x];
    const groupName = lddGroupNames(group);

    try {
      const groupFolderPath = join(groupsPath, group);
      const stat = statSync(groupFolderPath);

      if (stat.isDirectory()) {
        const components = getGroupComponents(groupFolderPath);

        if (components.length) {
          keepGroups.push(groupName);
        }

        const existingGroupDeclaration = lddJson.groups.find((g) => {
          return g.label === groupName;
        });

        if (existingGroupDeclaration) {
          const newGroupComponents = [];

          for (let j = 0; j < existingGroupDeclaration.components.length; j++) {
            const index = components.indexOf(
              existingGroupDeclaration.components[j],
            );

            if (index !== -1) {
              newGroupComponents.push(components[index]);
              components.splice(index, 1);
            }
          }

          for (let j = 0; j < components.length; j++) {
            newGroupComponents.push(components[j]);
          }

          existingGroupDeclaration.components = newGroupComponents;
        } else {
          lddJson.groups.push({
            label: groupName,
            components: components,
          });
        }
      } else {
        rmSync(groupFolderPath);
      }
    } catch (error) {
      logger.error(e);
      return false;
    }
  }

  const newMap = [];

  for (let i = 0; i < lddJson.groups.length; i++) {
    const c = lddJson.groups[i];
    if (keepGroups.includes(c.label)) {
      newMap.push(c);
    }
  }

  lddJson.groups = newMap;
}

/**
 * load and map all ld-conf.json + component.html to component configuration
 * @param {path} groupFolderPath
 * @returns {string[]}
 */
function getGroupComponents(groupFolderPath) {
  const componentFolders = readdirSync(groupFolderPath);
  const components = [];

  for (let j = 0; j < componentFolders.length; j++) {
    const component = componentFolders[j];

    try {
      const htmlPath = join(groupFolderPath, component, `${component}.html`);
      const ldConfPath = join(groupFolderPath, component, `ld-conf.json`);

      const htmlStat = statSync(htmlPath);
      const ldConfStat = statSync(ldConfPath);

      components.push(component);
    } catch (e) {}
  }

  return components;
}

async function mapComponents(lddJson) {
  const groupsPath = folders.ld;
  const groups = readdirSync(groupsPath);

  const lddComponents = [];
  const vueComponents = [];

  for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
    const group = groups[groupIndex];

    const groupPath = join(groupsPath, group);
    const components = readdirSync(groupPath);

    components.forEach((component) => {
      // ldd static component
      try {
        const htmlPath = join(groupPath, component, `${component}.html`);
        const ldConfPath = join(groupPath, component, `ld-conf.json`);

        const htmlStat = statSync(htmlPath);
        const ldConfStat = statSync(ldConfPath);

        const componentDeclaration = JSON.parse(
          readFileSync(ldConfPath, { encoding: 'utf-8' }),
        );
        const componentHtml = readFileSync(htmlPath, { encoding: 'utf-8' });

        lddComponents.push({ ...componentDeclaration, html: componentHtml });
      } catch (error) {}

      //   vue async component
      try {
        const vuePath = join(groupFolderPath, component, `${component}.vue`);
        const vueStat = statSync(vuePath);

        vueComponents.push({
          name: `SrlLd${toUpperCamelCase(component)}`,
          path: join('#ld', group, component, `${component}.vue`),
        });
      } catch (error) {}
    });
  }

  // write async components

  // write ldd components
  lddJson.components = lddComponents;

  const asyncComponents = [
    `import { defineAsyncComponent } from 'vue'`,
    `export default function asyncLdComponent(app) {`,
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
