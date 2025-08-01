import { type Plugin } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { readFileSync } from 'node:fs';
import { join } from 'node:path/posix';
import { execSync } from 'node:child_process';
import folders from '@multivisio/nswow/scripts/folders.js';
import { beaver } from '@multivisio/nswow/scripts/beaver.js';
import { packageName } from '@multivisio/nswow/scripts/config';
import { updatePackageJson, updateLivingDocsJson, updateNsWowJson } from '@multivisio/nswow/scripts/utils';
import {
  map,
  mapLdd,
  mapJs,
  mapScss,
} from '@multivisio/nswow/scripts/build.js';
import chalk from 'chalk';

const msgBoxLength = 60;

function centerText(text: string): string {
  const padding = Math.max(0, (msgBoxLength - text.length) / 2);
  return (
    ' '.repeat(Math.floor(padding)) + text + ' '.repeat(Math.ceil(padding))
  );
}

function checkSrlVersion() {
  try {
    const pkgPath = join(folders.packagePath, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    const current = pkg.version;
    if (!current) return;

    const tag = `v${current.split('.')[0]}-lts`;

    const latest = execSync(`npm view ${packageName}@${tag} version`)
      .toString()
      .trim();

    if (current < latest) {
      console.log('');
      console.log(chalk.bgWhiteBright(centerText('')));
      console.log(
        chalk.bgWhiteBright.redBright.bold(centerText('Attention !!!')),
      );
      console.log(
        chalk.bgWhiteBright.black.bold(
          centerText(`New ${packageName} version available.`),
        ),
      );
      console.log(
        chalk.bgWhiteBright.black.bold(
          centerText(`Update: ${current} => ${latest}`),
        ),
      );
      console.log(
        chalk.bgWhiteBright.black.bold(
          centerText(`Run: npm update -S ${packageName}`),
        ),
      );
      console.log(chalk.bgWhiteBright(centerText('')));
      console.log('');
    }
  } catch (e) {}
}

let timer: NodeJS.Timeout | null = null;

function triggerAction(callback) {
  !timer || clearTimeout(timer);
  timer = setTimeout(async () => {
    await callback();
  }, 200);
}

async function startActions() {
  checkSrlVersion();
  await beaver(0);
  await map();
  await mapJs();
}

export default function viteSrlPlugin(): Plugin {
  return {
    name: 'vite-srl-plugin',
    config(config) {
      startActions();

      config.base = './';

      config.resolve = config.resolve || {};
      config.resolve.alias['~'] = fileURLToPath(
        new URL('../..', import.meta.url),
      );
      config.resolve.alias['@'] = fileURLToPath(
        new URL('../../src', import.meta.url),
      );
      config.resolve.alias['#components'] = fileURLToPath(
        new URL('../components', import.meta.url),
      );
      config.resolve.alias['#composables'] = fileURLToPath(
        new URL('../composables', import.meta.url),
      );
      config.resolve.alias['#plugins'] = fileURLToPath(
        new URL('../plugins', import.meta.url),
      );
      config.resolve.alias['#types'] = fileURLToPath(
        new URL('../types', import.meta.url),
      );
      config.resolve.alias['#utils'] = fileURLToPath(
        new URL('../utils', import.meta.url),
      );
      config.resolve.alias['#imports'] = fileURLToPath(
        new URL('../imports', import.meta.url),
      );
      config.resolve.alias['#ld'] = fileURLToPath(
        new URL('../../livingdocs', import.meta.url),
      );
      config.resolve.alias['assets'] = fileURLToPath(
        new URL('../../src/assets', import.meta.url),
      );
      config.resolve.alias['srl'] = fileURLToPath(
        new URL('../srl', import.meta.url),
      );
      config.resolve.alias['vue'] = 'vue/dist/vue.esm-bundler.js';
    },
    configureServer(server) {
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
      });
    },
  };
}
