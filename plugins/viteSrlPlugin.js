import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path/posix';
import { execSync } from 'node:child_process';
import folders from '../scripts/folders.js';
import { beaver } from '../scripts/beaver.js';
import { packageName } from '../scripts/config.js';
import prepare from '../scripts/prepare.js';
import { updatePackageJson, updateLivingDocsJson, updateNsWowJson } from '../scripts/utils.js';
import {
  map,
  mapLdd,
  mapJs,
  mapScss,
} from '../scripts/build.js';
import chalk from 'chalk';
import { vueComponents } from '../scripts/vue/components.js';


/**
 * Output prompts message in a box
 */
const msgBoxLength = 60;
function centerText(text) {
  const padding = Math.max(0, (msgBoxLength - text.length) / 2);
  return (
    ' '.repeat(Math.floor(padding)) + text + ' '.repeat(Math.ceil(padding))
  );
}
function printPromptsMessage(messages) {
  console.log('');
  console.log(chalk.bgWhiteBright(centerText('')));
  messages.forEach(m => {
    console.log(chalk.bgWhiteBright.black.bold(centerText(m)));
  })
  console.log(chalk.bgWhiteBright(centerText('')));
  console.log('');
}

const data = {
  version: null
};
const srlConfig = readConfigJson();

function readConfigJson() {
  const configPath = join(folders.srlRoot, 'config.json');
  if (existsSync(configPath)) {
    const content = readFileSync(configPath, 'utf-8');
    return JSON.parse(content);
  }
  return null;
}

function writeConfigJson(config) {
  const configPath = join(folders.srlRoot, 'config.json');
  writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

function isVersionGreater(v1, v2) {
  const a = v1.split('.').map(Number);
  const b = v2.split('.').map(Number);
  if (a[0] > b[0]) return false;
  if (a[1] > b[1]) return false;
  return a[2] > b[2];
}

function getPackageVersion() {
  try {
    const pkgPath = join(folders.packagePath, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    return pkg.version || null;
  } catch (e) {
    return null;
  }
}

function checkForUpdates() {
  try {
    if (!data.version) return;

    const tag = `v${data.version.split('.')[0]}-lts`;

    const latest = execSync(`npm view ${packageName}@${tag} version`)
      .toString()
      .trim();

    if (isVersionGreater(latest, data.version)) {
      printPromptsMessage([
        'Attention !!!',
        `New ${packageName} version available.`,
        `Update: ${data.version} => ${latest}`,
        `Run: npm update -S ${packageName}`,
      ])
    }
  } catch (e) {}
}
async function startActions() {
  data.version = getPackageVersion();
  checkForUpdates();
  if (!srlConfig || JSON.stringify(srlConfig) !== JSON.stringify(data)) {
    writeConfigJson(data);
  }
  if (srlConfig && srlConfig.version !== data.version) {
    await prepare();
    printPromptsMessage([
      'Srl version changed',
      'Trigger srl prepare',
    ]);
  }

  await vueComponents();
  await beaver(0);
  await map();
  await mapJs();
}


/**
 * Timer to trigger live reload actions
 */
let timer = null;
function triggerAction(callback) {
  !timer || clearTimeout(timer);
  timer = setTimeout(async () => {
    await callback();
  }, 200);
}

export default function viteSrlPlugin() {
  return {
    name: 'vite-srl-plugin',
    config(config) {
      startActions();

      config.base = './';

      config.resolve = config.resolve || {};
      config.resolve.alias = config.resolve.alias || {};
      config.resolve.alias['~'] = folders.root;
      config.resolve.alias['@'] = folders.srlSrc;
      config.resolve.alias['#srl'] = folders.srlRoot;
      config.resolve.alias['#components'] = folders.srlComponents;
      config.resolve.alias['#composables'] = folders.srlComposables;
      config.resolve.alias['#plugins'] = folders.srlPlugins;
      config.resolve.alias['#types'] = folders.srlTypes;
      config.resolve.alias['#utils'] = folders.srlUtils;
      config.resolve.alias['#imports'] = folders.srlImports;
      config.resolve.alias['#ld'] = folders.ld;
      config.resolve.alias['assets'] = folders.srlAssets;
      config.resolve.alias['srl'] = folders.srlSystem;
      config.resolve.alias['vue'] = 'vue/dist/vue.esm-bundler.js';
    },
    async configureServer(server) {
      const fontPath = join(folders.srlAssets, 'fonts');

      server.watcher.on('change', async (path) => {
        if (path.endsWith('/package.json')) {
          await updatePackageJson();
        }
        if (path.endsWith('/livingdocs.config.json')) {
          await updateLivingDocsJson();
        }
        if (path.endsWith('/srl.config.json')) {
          await updateNsWowJson();
          triggerAction(beaver);
        }
      });

      server.watcher.on('add', (path) => {
        if (
          path.endsWith('/general.scss') ||
          path.endsWith('/app.scss') ||
          path.endsWith('/ldd.scss') ||
          path.endsWith('/editor.scss') ||
          path.endsWith('/pdf.scss') ||
          path.endsWith('/word.scss') ||
          path.endsWith('/xbrl.scss') ||
          (
            path.startsWith(fontPath) &&
            path.endsWith('.scss')
          )
        ) {
          triggerAction(mapScss);
        }

        if (
          path.includes('livingdocs') &&
          (path.endsWith('/app.js') || path.endsWith('/app.ts'))
        ) {
          triggerAction(mapJs);
        }

        if (
          path.includes('livingdocs') &&
          (path.endsWith('/properties.json') ||
            path.endsWith('/properties.ts') ||
            path.endsWith('/properties.js') ||
            path.endsWith('.vue'))
        ) {
          triggerAction(mapLdd);
        }

        if (
          path.includes('src/components/') &&
          path.endsWith('.vue')
        ) {
          triggerAction(vueComponents);
        }
      });

      server.watcher.on('unlink', (path) => {
        if (
          path.endsWith('/general.scss') ||
          path.endsWith('/app.scss') ||
          path.endsWith('/ldd.scss') ||
          path.endsWith('/editor.scss') ||
          path.endsWith('/pdf.scss') ||
          path.endsWith('/word.scss') ||
          path.endsWith('/xbrl.scss')||
          (
            path.startsWith(fontPath) &&
            path.endsWith('.scss')
          )
        ) {
          triggerAction(mapScss);
        }

        if (
          path.includes('livingdocs') &&
          (path.endsWith('/app.js') || path.endsWith('/app.ts'))
        ) {
          triggerAction(mapJs);
        }

        if (
          path.includes('livingdocs') &&
          (path.endsWith('/properties.json') ||
            path.endsWith('/properties.ts') ||
            path.endsWith('/properties.js') ||
            path.endsWith('.vue'))
        ) {
          triggerAction(mapLdd);
        }

        if (
          path.includes('src/components/') &&
          path.endsWith('.vue')
        ) {
          triggerAction(vueComponents);
        }
      });
    },
  };
}
