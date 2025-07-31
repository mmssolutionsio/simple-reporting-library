import { join } from 'node:path/posix';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { globSync } from 'glob';
import writeJson from 'write-json';
import ts from 'typescript';
import Enquirer from 'enquirer';
import { packageName } from './config.js';
import { getPackageVersion } from './utils.js';

const { Input } = Enquirer;

async function compile(fileNames, options) {
  // Create a Program with an in-memory emit
  const createdFiles = {};
  const host = ts.createCompilerHost(options);
  host.writeFile = (fileName, contents) => (createdFiles[fileName] = contents);

  // Prepare and emit the d.ts files
  const program = ts.createProgram(fileNames, options, host);
  program.emit();

  for (const file in createdFiles) {
    const content = createdFiles[file];
    await writeFileSync(file, content);
  }
}

export async function preparePublish(version) {

  if (version) {
    const packageJson = JSON.parse(
      await readFileSync(join(process.cwd(), 'package.json')),
    );
    packageJson.version = version;
    await writeJson(join(process.cwd(), 'package.json'), packageJson);

    const devJson = JSON.parse(
      await readFileSync(join(process.cwd(), 'dev', 'package.json')),
    );
    devJson.dependencies[packageName] = `^${version}`;
    await writeJson(join(process.cwd(), 'dev', 'package.json'), devJson);
  }

  const typescriptFiles = await globSync(
    join(process.cwd(), 'scripts', '**', '*.d.ts'),
  );
  for (let i = 0; i < typescriptFiles.length; i++) {
    await rmSync(typescriptFiles[i]);
  }

  const jsFiles = await globSync(join(process.cwd(), 'scripts', '**', '*.js'));

  await compile(jsFiles, {
    allowJs: true,
    declaration: true,
    emitDeclarationOnly: true,
  });

  const vueComponents = await globSync(
    join(process.cwd(), 'src', '**', '*.vue'),
  );
  await compile(vueComponents, {
    allowJs: true,
    declaration: true,
    emitDeclarationOnly: true,
  });

  return version;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    let version = null;
    const indexVersion = process.argv.indexOf('-v');
    if (indexVersion !== -1 && process.argv[indexVersion + 1]) {
      const newVersion = process.argv[indexVersion + 1];
      if (/^\d+\.\d+\.\d+$/.test(newVersion)) {
        version = newVersion;
      } else {
        throw new Error(
          `Invalid version format ${newVersion}. Use $number.$number.$number`,
        );
      }
    }
    preparePublish(version);
  } catch (error) {
    console.error(error);
  }
}
