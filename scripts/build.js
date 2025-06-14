import { resolve } from 'node:path';
import {
  statSync,
  writeFileSync,
  readFileSync,
  mkdirSync,
  readdirSync,
  createWriteStream,
  rmSync,
  cpSync,
} from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { createRequire } from 'node:module';
import { glob } from 'glob';
import { beaver } from './beaver.js';
import { build as viteBuild } from 'vite';
import { build as finalizeLdd } from './migrate-livingdocs-build/bin/build.js';
import {
  readPackageJson,
  writePackageJson,
  readLivingDocsJson,
  writeLivingDocsJson,
} from './utils.js';
import { camelCase } from 'cheerio/utils';

const placeholderId = '6297EAFB-33A0-48B8-8D64-E61CDC3E9035';
const CWD = process.cwd();
const nswowPath = resolve(CWD, '.nswow');
const outputPath = resolve(CWD, '.output');
const require = createRequire(import.meta.url);

const { Input } = require('enquirer');

let foldersChecked = false;

/**
 * Checks if the required folders exist and creates them if necessary.
 *
 * @async
 * @returns {Promise<boolean>} A promise that resolves to true once the folders are checked and created.
 */
async function checkFolders() {
  if (!foldersChecked) {
    foldersChecked = true;
    try {
      await statSync(nswowPath);
    } catch (e) {
      await mkdirSync(nswowPath);
    }
    try {
      await statSync(outputPath);
    } catch (e) {
      await mkdirSync(outputPath);
    }
  }
  return true;
}

/**
 * Cleans the output directory by removing all files and folders.
 *
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether the cleanup was successful.
 */
async function cleanOutput() {
  await checkFolders();
  const output = readdirSync(outputPath);
  for (let i = 0; i < output.length; i++) {
    await rmSync(`${outputPath}/${output[i]}`, {
      force: true,
      recursive: true,
    });
  }
  return true;
}

/**
 * Builds the application by performing the following steps:
 *
 * 1. Checks the folders.
 * 2. Executes the viteBuild function.
 *
 * @returns {Promise<void>} A Promise that resolves when the application is built.
 */
async function buildApp() {
  await checkFolders();
  const build = await viteBuild({
    build: {
      copyPublicDir: false,
    },
  });

  // Copy public folder exclude nswow folders
  console.log(
    '\n\nCopy public folder exclude nswow folders and exclude folder',
  );
  await cpSync(`${CWD}/public/`, `${outputPath}/app`, {
    filter: (src) => {
      if (
        src.startsWith(`${CWD}/public/downloads`) ||
        src.startsWith(`${CWD}/public/html`) ||
        src.startsWith(`${CWD}/public/images`) ||
        src.startsWith(`${CWD}/public/json`) ||
        src.startsWith(`${CWD}/public/exclude`)
      ) {
        return false;
      } else {
        src === `${CWD}/public/` ||
          console.log(`Copy ${src} to ${outputPath}/app`);
        return true;
      }
    },
    recursive: true,
  });
  console.log('\n');

  console.log('Create fallback file worker.html for service worker');
  let index = await readFileSync(`${outputPath}/app/index.html`, 'utf8');

  await writeFileSync(`${outputPath}/app/worker.html`, index);

  console.log('Create file /template/article.html for nswow hybrid\n');
  index = index.replace(
    '<html>',
    `<html lang="[[language-${placeholderId}]]">`,
  );
  index = index.replace(
    /<base\s+href\s*=\s*(['"])(.*?)\1\s*\/?>/gi,
    `<base href="[[base-${placeholderId}]]" />
    [[meta-${placeholderId}]]`,
  );
  await mkdirSync(`${outputPath}/app/template`, { recursive: true });
  await writeFileSync(`${outputPath}/app/template/article.html`, index);
  /**
   await writeFileSync(`${outputPath}/app/web.config`, `<?xml version="1.0" encoding="UTF-8"?>
   <configuration>
   <system.webServer>
   <rewrite>
   <rules>
   <rule name="Rewrite to index.html" stopProcessing="true">
   <match url=".*" />
   <conditions logicalGrouping="MatchAll">
   <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
   <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
   </conditions>
   <action type="Rewrite" url="index.html" />
   </rule>
   </rules>
   </rewrite>
   </system.webServer>
   </configuration>`);
   await writeFileSync(`${outputPath}/app/.htaccess`, `RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-l
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule ^(.*)$ index.html [L]`);
   /**/
  return build;
}

/**
 * Builds the application by performing the following steps:
 *
 * 1. Checks the folders.
 * 2. Executes the viteBuild function.
 *
 * @returns {Promise<void>} A Promise that resolves when the application is built.
 */
async function buildDDev() {
  await checkFolders();
  const build = await viteBuild({
    build: {
      outDir: './.output/ddev',
    },
  });
  return build;
}

/**
 * Compresses the 'app' folder into a zip file using archiver library.
 *
 * @async
 * @function zipApp
 * @returns {Promise<void>} - A Promise that resolves when the zip operation is complete, or rejects with an error.
 */
async function zipApp() {
  await checkFolders();
  const archiver = require('archiver');
  const output = createWriteStream(outputPath + '/app.zip');
  const archive = archiver('zip', {
    zlib: { level: 9 }, // Sets the compression level.
  });
  output.on('close', function () {
    console.log('Create zip ' + outputPath + '/app.zip');
    console.log(archive.pointer() + ' total bytes');
  });
  output.on('end', function () {
    console.log('Data has been drained');
  });
  archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
      console.error(err);
    } else {
      // throw error
      throw err;
    }
  });
  archive.on('error', function (err) {
    throw err;
  });
  archive.pipe(output);
  archive.directory(outputPath + '/app/', false);
  archive.finalize();
}

/**
 * Builds a PDF using the provided HTML template.
 *
 * @returns {Promise<boolean>} - Returns a Promise that resolves to true if the PDF was successfully built,
 *                              false otherwise.
 */
async function buildPdf() {
  await checkFolders();

  try {
    const input = resolve(CWD, 'pdf.html');
    await statSync(input);
    return await viteBuild({
      build: {
        outDir: resolve(CWD, '.output/pdf'),
        rollupOptions: {
          input: {
            pdf: input,
          },
          output: {
            entryFileNames: `[name].js`,
            chunkFileNames: `[name].js`,
            assetFileNames: `[name].[ext]`,
          },
        },
        copyPublicDir: false,
      },
    });
  } catch (e) {
    let configFile = false;
    try {
      const file = resolve(CWD, 'vite.config.pdf.ts');
      await statSync(file);
      console.log('Use vite.config.pdf.ts file');
      configFile = file;
    } catch (e) {
      console.log('No use of vite.config.pdf.ts file');
    }

    const entry = resolve(CWD, 'pdf.ts');

    const config = {
      configFile: configFile,
      base: './',
      build: {
        outDir: resolve(CWD, '.output/pdf'),
        lib: {
          fileName: 'pdf',
          entry: entry,
          formats: ['es'],
        },
      },
      resolve: {
        alias: {
          '@': fileURLToPath(new URL(resolve(CWD, 'src'), import.meta.url)),
          nswow: fileURLToPath(new URL(resolve(CWD, 'nswow'), import.meta.url)),
        },
      },
      publicDir: false,
    };

    try {
      return await viteBuild(config);
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}

/**
 * Builds Living Documentation (LDD) for a project.
 *
 * @async
 * @param {string} version - The version number to update in the project's package.json file. (optional)
 * @returns {Promise<boolean>} - A Promise that resolves to true if the LDD build is successful, false otherwise.
 */
async function buildLdd(version) {
  let action = false;
  await checkFolders();

  const packageJson = await readPackageJson();
  const lddJson = await readLivingDocsJson();

  if (version) {
    packageJson.version = version;
    await writePackageJson(packageJson);
    action = true;
  }

  lddJson.name = packageJson.name;
  lddJson.version = packageJson.version;

  const input = resolve(CWD, 'ldd.html');
  try {
    await statSync(input);
  } catch (e) {
    return true;
  }
  try {
    await writeFileSync(`${outputPath}/v${lddJson.version}.txt`, '');
    return await viteBuild({
      build: {
        outDir: './.output/ldd',
        rollupOptions: {
          input: {
            ldd: input,
          },
          output: {
            entryFileNames: `assets/[name].js`,
            chunkFileNames: `assets/[name].js`,
            assetFileNames: `assets/[name].[ext]`,
          },
        },
        copyPublicDir: false,
      },
    })
      .then(async () => {
        const assetsPath = outputPath + '/ldd/assets';
        const assetsFiles = await readdirSync(assetsPath);
        for (let i = 0; i < assetsFiles.length; i++) {
          const file = assetsFiles[i];
          if (file.endsWith('.css')) {
            const path = './assets/' + file;
            if (!lddJson.assets.css.includes(path)) {
              action = true;
              lddJson.assets.css.push(path);
            }
          }
          if (file.endsWith('.js')) {
            const path = './assets/' + file;
            if (!lddJson.assets.js.includes(path)) {
              action = true;
              lddJson.assets.js.push(path);
            }
          }
        }
        if (action) {
          await writeLivingDocsJson(lddJson);
        }
        return true;
      })
      .then(async () => {
        return await finalizeLdd();
      });
  } catch (e) {
    console.error(e);
    return false;
  }
}

/**
 * Builds the word document by compiling the HTML file using Vite and
 * returns the result.
 *
 * @returns {Promise<boolean>} - A promise that resolves to true if the word document is successfully built,
 *                              or false if there was an error during the build process.
 */
async function buildWord() {
  await checkFolders();

  try {
    const input = resolve(CWD, 'word.html');
    await statSync(input);
    return await viteBuild({
      build: {
        outDir: resolve(CWD, '.output/word'),
        rollupOptions: {
          input: {
            word: input,
          },
          output: {
            entryFileNames: `[name].js`,
            chunkFileNames: `[name].js`,
            assetFileNames: `[name].[ext]`,
          },
        },
        copyPublicDir: false,
      },
    });
  } catch (e) {
    let configFile = false;
    try {
      const file = resolve(CWD, 'vite.config.word.ts');
      await statSync(file);
      console.log('Use vite.config.word.ts file');
      configFile = file;
    } catch (e) {
      console.log('No use of vite.config.word.ts file');
    }

    const entry = resolve(CWD, 'word.ts');

    const config = {
      configFile: configFile,
      base: './',
      build: {
        outDir: resolve(CWD, '.output/word'),
        lib: {
          fileName: 'word',
          entry: entry,
          formats: ['es'],
        },
      },
      resolve: {
        alias: {
          '@': fileURLToPath(new URL(resolve(CWD, 'src'), import.meta.url)),
          nswow: fileURLToPath(new URL(resolve(CWD, 'nswow'), import.meta.url)),
        },
      },
      publicDir: false,
    };

    try {
      return await viteBuild(config);
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}

/**
 * Builds the project sequentially by executing a series of asynchronous tasks in a specific order.
 * This method is used to build the project in a predetermined sequence.
 *
 * @return {Promise<void>} A Promise that resolves when the build process is completed or rejects if an error occurs.
 */
async function build() {
  try {
    await checkFolders();
    const packageJson = await readPackageJson();
    const prompt = new Input({
      message: 'Livingdocs version',
      initial: packageJson.version,
    });
    const version = await prompt.run();
    await cleanOutput();
    await beaver(1);
    await mapScss();
    await mapLdd();
    await buildApp();
    await buildPdf();
    await buildWord();
    await buildLdd(version);
    await zipApp();
  } catch (error) {
    console.log(error);
  }
}

/**
 * Builds the project sequentially by executing a series of asynchronous tasks in a specific order.
 * This method is used to build the project in a predetermined sequence.
 *
 * @return {Promise<void>} A Promise that resolves when the build process is completed or rejects if an error occurs.
 */
async function ddev() {
  try {
    await checkFolders();
    const packageJson = await readPackageJson();
    await beaver(1);
    await mapScss();
    await mapLdd();
    await buildDDev();
  } catch (error) {
    console.error(error);
  }
}

/**
 * Cleans up the SCSS alias by removing any characters that are not alphanumeric.
 * @param string
 */
function cleanupScssAlias(string) {
  return string.replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Maps SCSS files and generates import statements for different output files.
 *
 * @returns {Promise<boolean>} Returns a promise that resolves to true if the SCSS mapping is successful, and false if there's an error.
 */
async function mapScss() {
  await checkFolders();
  try {
    const relativePathToRoot = '../';

    const output = {
      app: [],
      ldd: [],
      pdf: [],
      word: [],
    };

    const mainFiles = await glob(
      resolve(process.cwd(), './src/assets/scss/*.scss'),
      {
        withFileTypes: true,
      },
    );

    let f = mainFiles.find((p) => {
      return p.name === 'general.scss';
    });

    const alias = cleanupScssAlias(f.relative());

    if (f) {
      output.app.push(`"${relativePathToRoot}${f.relative()}" as ${alias}`);
      output.ldd.push(`"${relativePathToRoot}${f.relative()}" as ${alias}`);
      output.pdf.push(`"${relativePathToRoot}${f.relative()}" as ${alias}`);
      output.word.push(`"${relativePathToRoot}${f.relative()}" as ${alias}`);
    }

    for (let x = 0; x < mainFiles.length; x++) {
      const alias = cleanupScssAlias(mainFiles[x].relative());
      if (mainFiles[x].name === 'app.scss') {
        output.app.push(
          `"${relativePathToRoot}${mainFiles[x].relative()}" as ${alias}`,
        );
      }
      if (mainFiles[x].name === 'ldd.scss') {
        output.ldd.push(
          `"${relativePathToRoot}${mainFiles[x].relative()}" as ${alias}`,
        );
      }
      if (mainFiles[x].name === 'pdf.scss') {
        output.pdf.push(
          `"${relativePathToRoot}${mainFiles[x].relative()}" as ${alias}`,
        );
      }
      if (mainFiles[x].name === 'word.scss') {
        output.word.push(
          `"${relativePathToRoot}${mainFiles[x].relative()}" as ${alias}`,
        );
      }
    }

    const livingdocs = await glob(resolve(process.cwd(), './livingdocs/**/*'), {
      maxDepth: 3,
      withFileTypes: true,
    });
    livingdocs.sort((a, b) => {
      const valueA = a.relative().toUpperCase();
      const valueB = b.relative().toUpperCase();
      if (valueA < valueB) {
        return -1;
      }
      if (valueA > valueB) {
        return 1;
      }
      return 0;
    });

    const components = livingdocs.filter((p) => {
      return p.name !== 'Properties' && p.parent.name !== 'Properties';
    });

    const properties = livingdocs.filter((p) => {
      return p.name === 'Properties' || p.parent.name === 'Properties';
    });

    const livingdocsList = [...components, ...properties];

    for (let x = 0; x < livingdocsList.length; x++) {
      const p = livingdocsList[x];
      try {
        const general = await statSync(p.fullpath() + '/general.scss');
        const alias = cleanupScssAlias(`${p.relative()}/general.scss`);
        output.app.push(
          `"${relativePathToRoot}${p.relative()}/general.scss" as ${alias}`,
        );
        output.ldd.push(
          `"${relativePathToRoot}${p.relative()}/general.scss" as ${alias}`,
        );
        output.pdf.push(
          `"${relativePathToRoot}${p.relative()}/general.scss" as ${alias}`,
        );
        output.word.push(
          `"${relativePathToRoot}${p.relative()}/general.scss" as ${alias}`,
        );
      } catch (e) {}

      const types = ['app', 'ldd', 'pdf', 'word'];

      for (let i = 0; i < types.length; i++) {
        const type = types[i];
        try {
          const f = await statSync(p.fullpath() + '/' + type + '.scss');
          const alias = cleanupScssAlias(`${p.relative()}/${type}.scss`);
          output[type].push(
            `"${relativePathToRoot}${p.relative()}/${type}.scss" as ${alias}`,
          );
        } catch (e) {}
      }
    }

    await writeFileSync(
      `${CWD}/.nswow/app.scss`,
      `@use ` +
        output.app.join(';\n@use ') +
        `;\n@use "nswow/core-styles" as nswowcorestyles;\n`,
    );
    await writeFileSync(
      `${CWD}/.nswow/ldd.scss`,
      `@use ` +
        output.ldd.join(';\n@use ') +
        `;\n@use "nswow/core-styles" as nswowcorestyles;\n`,
    );
    await writeFileSync(
      `${CWD}/.nswow/pdf.scss`,
      `@use ` +
        output.pdf.join(';\n@use ') +
        `;\n@use "nswow/core-styles" as nswowcorestyles;\n`,
    );
    await writeFileSync(
      `${CWD}/.nswow/word.scss`,
      `@use ` +
        output.word.join(';\n@use ') +
        `;\n@use "nswow/core-styles" as nswowcorestyles;\n`,
    );

    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

/**
 * This function asynchronously maps JavaScript files and imports them into specific files.
 * @returns {Promise<boolean>} - A promise that resolves to true if the mapping and importing is successful.
 */
async function mapJs() {
  const jsFiles = await glob(resolve(CWD, './livingdocs/' + '**/app.[t,j]s'), {
    withFileTypes: true,
  });

  const imports = [];
  const register = [];

  for (let i = 0; i < jsFiles.length; i++) {
    const file = jsFiles[i];
    const className = camelCase(file.parent.name);
    const path = [file.name];
    let parent = file.parent;
    while (parent) {
      path.unshift(parent.name);
      if (parent.name !== 'livingdocs') {
        parent = parent.parent;
      } else {
        parent = false;
      }
    }
    imports.push(`import ${className} from "../${path.join(file.sep)}"`);
    register.push(`ClassAutoLoader.register(${className}, "${className}")`);
  }

  const content = `import ArticleAutoloader from 'nswow/ArticleAutoloader'
${imports.join('\n')}
const ClassAutoLoader = new ArticleAutoloader()
${register.join('\n')}
export default ClassAutoLoader
export { ClassAutoLoader }`;

  await writeFileSync(resolve(CWD, './src/Autoload.ts'), content);
  return true;
}

/**
 * Maps the livingdocs properties to components and groups.
 *
 * @returns {Promise<boolean>} Returns a promise that resolves to a boolean indicating the success or failure of the mapping.
 */
async function mapLdd() {
  await checkFolders();
  try {
    const lddJson = await readLivingDocsJson();

    const propertiesFiles = await glob(
      resolve(CWD, './livingdocs/**/properties.{json,js,ts}'),
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

    const groupsPath = resolve(CWD, './livingdocs');
    const groups = readdirSync(groupsPath);
    const keepGroups = [];

    for (let x = 0; x < groups.length; x++) {
      const group = groups[x];
      const groupName = group.replace('_and_', ' / ').replace('_', ' ');
      try {
        const stat = statSync(`${groupsPath}/${group}`);
        if (stat.isDirectory()) {
          const components = [];
          const c = readdirSync(`${groupsPath}/${group}`);
          for (let j = 0; j < c.length; j++) {
            const component = c[j];
            try {
              const stat = statSync(
                `${groupsPath}/${group}/${component}/${component}.html`,
              );
              components.push(component);
            } catch (e) {}
          }
          if (components.length) {
            keepGroups.push(groupName);
            const i = lddJson.groups.find((g) => {
              return g.label === groupName;
            });
            if (i) {
              const newComponents = [];
              for (let j = 0; j < i.components.length; j++) {
                const index = components.indexOf(i.components[j]);
                if (index !== -1) {
                  newComponents.push(components[index]);
                  components.splice(index, 1);
                }
              }
              for (let j = 0; j < components.length; j++) {
                newComponents.push(components[j]);
              }

              i.components = newComponents;
            } else {
              lddJson.groups.push({
                label: groupName,
                components: components,
              });
            }
          }
        } else {
          rmSync(`${groupsPath}/${group}`);
        }
      } catch (e) {
        console.log(e);
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
    await writeLivingDocsJson(lddJson);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

/**
 * Maps the SCSS files and the LDD files in the project.
 *
 * @async
 * @function map
 * @returns {Promise<boolean>} A promise that resolves after successfully mapping the files.
 * @throws {Error} If there is an error during the mapping process.
 */
async function map() {
  await checkFolders();
  await mapScss();
  await mapLdd();
  return true;
}

export { build, ddev, map, mapScss, mapLdd, mapJs };
