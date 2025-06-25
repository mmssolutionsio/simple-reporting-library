import { join } from 'node:path/posix';
import {
  statSync,
  writeFileSync,
  readFileSync,
  mkdirSync,
  readdirSync,
  createWriteStream,
  rmSync,
  cpSync,
  copyFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { glob } from 'glob';
import { beaver } from './beaver.js';
import { build as viteBuild } from 'vite';
import {
  readPackageJson,
  writePackageJson,
  readLivingDocsJson,
  writeLivingDocsJson,
} from './utils.js';
import folders from './folders.js';
import { mapLdd } from './ldd/mapLdd.js';
import { LivingdocsDesignValidator } from './ldd/LivingdocsDesignValidator.js';
import { camelCase } from './utils.js';

const placeholderId = '6297EAFB-33A0-48B8-8D64-E61CDC3E9035';
const nswowPath = folders.srlImports;
const outputPath = folders.srlOutput;
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
    await rmSync(join(outputPath, output[i]), {
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
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
    publicDir: false,
  });

  // Copy public folder exclude nswow folders
  console.log(
    '\n\nCopy public folder exclude nswow folders and exclude folder',
  );
  await cpSync(join(folders.srlPublic, '/'), join(outputPath, 'app'), {
    filter: (src) => {
      if (
        src.startsWith(join(folders.srlPublic, 'downloads')) ||
        src.startsWith(join(folders.srlPublic, 'html')) ||
        src.startsWith(join(folders.srlPublic, 'images')) ||
        src.startsWith(join(folders.srlPublic, 'json')) ||
        src.startsWith(join(folders.srlPublic, 'exclude'))
      ) {
        return false;
      } else {
        src === join(folders.srlPublic, '/') ||
          console.log(`Copy ${src} to ${outputPath}/app`);
        return true;
      }
    },
    recursive: true,
  });
  console.log('\n');

  let index = await readFileSync(
    join(folders.srlOutput, 'app', 'index.html'),
    'utf8',
  );

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

  index = index.replace(
    /(<div\s+[^>]*id\s*=\s*["']app["'][^>]*>)([\s\S]*?)(<\/div>)/i,
    `$1
      <template>
        [[content-${placeholderId}]]
      </template>
    $3`,
  );

  await mkdirSync(join(outputPath, 'app', 'template'), { recursive: true });
  await writeFileSync(
    join(outputPath, 'app', 'template', 'article.html'),
    index,
  );
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
    publicDir: false,
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
  const output = createWriteStream(join(outputPath, 'app.zip'));
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
  archive.directory(join(outputPath, 'app', '/'), false);
  archive.finalize();
}

async function zipLdd() {
  await checkFolders();
  const archiver = require('archiver');
  const output = createWriteStream(join(outputPath, 'design.zip'));
  const archive = archiver('zip', {
    zlib: { level: 9 }, // Sets the compression level.
  });
  output.on('close', function () {
    console.log('Create zip ' + outputPath + '/design.zip');
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
  archive.directory(join(outputPath, 'ldd', '/'), false);
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

  const config = {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
    base: './',
    build: {
      outDir: join(folders.srlOutput, 'pdf'),
      lib: {
        fileName: 'pdf',
        entry: join(folders.srlEntries, 'pdf.ts'),
        formats: ['es'],
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

async function buildXbrl() {
  await checkFolders();

  const config = {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
    base: './',
    build: {
      outDir: join(folders.srlOutput, 'xbrl'),
      lib: {
        fileName: 'xbrl',
        entry: join(folders.srlEntries, 'xbrl.ts'),
        formats: ['es'],
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
  await mapLdd();

  const packageJson = await readPackageJson();
  const lddJson = await readLivingDocsJson();

  if (version) {
    packageJson.version = version;
    await writePackageJson(packageJson);
    action = true;
  }

  lddJson.name = packageJson.name;
  lddJson.version = packageJson.version;

  const config = {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
    base: './',
    build: {
      outDir: join(folders.srlOutput, 'ldd', 'assets'),
      lib: {
        fileName: 'ldd',
        entry: join(folders.srlEntries, 'ldd.ts'),
        formats: ['es'],
      },
    },
    publicDir: false,
  };

  await writeFileSync(join(outputPath, `v${lddJson.version}.txt`), '');

  try {
    return await viteBuild(config)
      .then(async () => {
        const assetsPath = join(outputPath, 'ldd', 'assets');
        const assetsFiles = await readdirSync(assetsPath);
        lddJson.assets.css = [];
        lddJson.assets.js = [];
        for (let i = 0; i < assetsFiles.length; i++) {
          const file = assetsFiles[i];
          if (file.endsWith('.css')) {
            const path = join('./assets/' + file);
            if (!lddJson.assets.css.includes(path)) {
              action = true;
              lddJson.assets.css.push(path);
            }
          }
          if (file.endsWith('.js')) {
            const path = join('./assets/' + file);
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
        copyFileSync(
          join(folders.root, 'livingdocs.config.json'),
          join(folders.srlOutput, 'ldd', 'design.json'),
        );
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
  let configFile = false;

  const config = {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
    base: './',
    build: {
      outDir: join(folders.srlOutput, 'word'),
      lib: {
        fileName: 'word',
        entry: join(folders.srlEntries, 'word.ts'),
        formats: ['es'],
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

/**
 * Builds the project sequentially by executing a series of asynchronous tasks in a specific order.
 * This method is used to build the project in a predetermined sequence.
 *
 * @param {string} version
 * @return {Promise<void>} A Promise that resolves when the build process is completed or rejects if an error occurs.
 */
async function build(version) {
  try {
    await checkFolders();
    const packageJson = await readPackageJson();

    if (!version) {
      const prompt = new Input({
        message: 'Livingdocs version',
        initial: packageJson.version,
      });
      version = await prompt.run();
    }
    await cleanOutput();
    await buildApp();
    await buildPdf();
    await buildWord();
    await buildXbrl();
    await buildLdd(version);
    new LivingdocsDesignValidator(await readLivingDocsJson()).IsDesignValid();
    await zipApp();
    await zipLdd();
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
    const relativePathToRoot = join('..', '..', '/');

    const output = {
      app: [],
      ldd: [],
      pdf: [],
      word: [],
      xbrl: [],
    };

    const mainFiles = await glob(join(folders.srlAssets, 'scss', '*.scss'), {
      withFileTypes: true,
    });

    let f = mainFiles.find((p) => {
      return p.name === 'general.scss';
    });

    if (f) {
      output.app.push(`"${relativePathToRoot}${f.relativePosix()}" as *`);
      output.ldd.push(`"${relativePathToRoot}${f.relativePosix()}" as *`);
      output.pdf.push(`"${relativePathToRoot}${f.relativePosix()}" as *`);
      output.word.push(`"${relativePathToRoot}${f.relativePosix()}" as *`);
    }

    for (let x = 0; x < mainFiles.length; x++) {
      const alias = cleanupScssAlias(mainFiles[x].relativePosix());
      if (mainFiles[x].name === 'app.scss') {
        output.app.push(
          `"${relativePathToRoot}${mainFiles[x].relativePosix()}" as *`,
        );
      }
      if (mainFiles[x].name === 'ldd.scss') {
        output.ldd.push(
          `"${relativePathToRoot}${mainFiles[x].relativePosix()}" as *`,
        );
      }
      if (mainFiles[x].name === 'pdf.scss') {
        output.pdf.push(
          `"${relativePathToRoot}${mainFiles[x].relativePosix()}" as *`,
        );
      }
      if (mainFiles[x].name === 'word.scss') {
        output.word.push(
          `"${relativePathToRoot}${mainFiles[x].relativePosix()}" as *`,
        );
      }
      if (mainFiles[x].name === 'xbrl.scss') {
        output.xbrl.push(
          `"${relativePathToRoot}${mainFiles[x].relativePosix()}" as *`,
        );
      }
    }

    const livingdocs = await glob(join(folders.ld, '**', '*'), {
      maxDepth: 3,
      withFileTypes: true,
    });
    livingdocs.sort((a, b) => {
      const valueA = a.relativePosix().toUpperCase();
      const valueB = b.relativePosix().toUpperCase();
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
        const general = await statSync(
          join(p.fullpath(), 'scss', 'general.scss'),
        );
        output.app.push(
          `"${relativePathToRoot}${p.relativePosix()}/scss/general.scss" as *`,
        );
        output.ldd.push(
          `"${relativePathToRoot}${p.relativePosix()}/scss/general.scss" as *`,
        );
        output.pdf.push(
          `"${relativePathToRoot}${p.relativePosix()}/scss/general.scss" as *`,
        );
        output.word.push(
          `"${relativePathToRoot}${p.relativePosix()}/scss/general.scss" as *`,
        );
      } catch (e) {}

      const types = ['app', 'ldd', 'pdf', 'word', 'xbrl'];

      for (let i = 0; i < types.length; i++) {
        const type = types[i];
        try {
          const f = await statSync(join(p.fullpath(), 'scss', `${type}.scss`));
          const alias = cleanupScssAlias(`${p.relativePosix()}/${type}.scss`);
          output[type].push(
            `"${relativePathToRoot}${p.relativePosix()}/scss/${type}.scss" as *`,
          );
        } catch (e) {}
      }
    }

    await writeFileSync(
      join(folders.srlImports, 'app.scss'),
      `@use ` +
        output.app.join(';\n@use ') +
        `;\n@use "../scss/core-styles.scss" as *;\n`,
    );
    await writeFileSync(
      join(folders.srlImports, 'ldd.scss'),
      `@use ` +
        output.ldd.join(';\n@use ') +
        `;\n@use "../scss/core-styles.scss" as *;\n`,
    );
    await writeFileSync(
      join(folders.srlImports, 'pdf.scss'),
      `@use ` +
        output.pdf.join(';\n@use ') +
        `;\n@use "../scss/core-styles.scss" as *;\n`,
    );
    await writeFileSync(
      join(folders.srlImports, 'word.scss'),
      `@use ` +
        output.word.join(';\n@use ') +
        `;\n@use "../scss/core-styles.scss" as *;\n`,
    );
    await writeFileSync(
      join(folders.srlImports, 'xbrl.scss'),
      `@use ` +
        output.xbrl.join(';\n@use ') +
        `;\n@use "../scss/xbrl-core-styles.scss" as *;\n`,
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
  const jsFiles = await glob(join(folders.ld, '**', 'app.[t,j]s'), {
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

  const content = `import ArticleAutoloader from 'srl/ArticleAutoloader'
${imports.join('\n')}
const ClassAutoLoader = new ArticleAutoloader()
${register.join('\n')}
export default ClassAutoLoader
export { ClassAutoLoader }`;

  await writeFileSync(join(folders.srlSrc, 'Autoload.ts'), content);
  return true;
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
