const { resolve } = require('node:path');
const { readFileSync, writeFileSync, rmSync } = require('node:fs');
const { globSync } = require('glob');
const writeJson = require('write-json');
const ts = require('typescript');
const enquirer = require('enquirer');
const { Input } = enquirer;
const { exec } = require('child_process');

function getPackageVersion(packageName) {
  return new Promise((resolve, reject) => {
    exec(`npm list ${packageName} --json`, (error, stdout, stderr) => {
      const jsonOutput = JSON.parse(stdout);
      resolve(jsonOutput.version);
    });
  });
}

async function compile(fileNames, options) {
  // Create a Program with an in-memory emit
  const createdFiles = {};
  const host = ts.createCompilerHost(options);
  host.writeFile = (fileName, contents) => (createdFiles[fileName] = contents);

  // Prepare and emit the d.ts files
  const program = ts.createProgram(fileNames, options, host);
  program.emit();

  for (file in createdFiles) {
    const content = createdFiles[file];
    await writeFileSync(file, content);
  }
}

async function action() {
  const nswowVersion = await getPackageVersion('@multivisio/nswow');

  const writeJson = require('write-json');
  const { globSync } = require('glob');

  const currentVersion = nswowVersion.split('.');
  let major = parseInt(currentVersion[0]);
  let minor = parseInt(currentVersion[1]);
  let patch = parseInt(currentVersion[2]);

  if (process.argv.includes('major')) {
    major++;
    minor = 0;
    patch = 0;
  } else if (process.argv.includes('minor')) {
    minor++;
    patch = 0;
  } else {
    patch++;
  }

  let version = `${major}.${minor}.${patch}`;

  const prompt = new Input({
    message: 'Package version',
    initial: version,
  });
  version = await prompt.run();

  if (version) {
    const packageJson = JSON.parse(
      await readFileSync(resolve(process.cwd(), './package.json')),
    );
    packageJson.version = version;
    await writeJson(resolve(process.cwd(), './package.json'), packageJson);

    const devJson = JSON.parse(
      await readFileSync(resolve(process.cwd(), './dev/package.json')),
    );
    devJson.devDependencies['@multivisio/nswow'] = `^${version}`;
    await writeJson(resolve(process.cwd(), './dev/package.json'), devJson);
  }

  const typescriptFiles = await globSync(
    resolve(process.cwd(), './scripts/**/*.d.ts'),
  );
  for (let i = 0; i < typescriptFiles.length; i++) {
    await rmSync(typescriptFiles[i]);
  }

  const jsFiles = await globSync(resolve(process.cwd(), './scripts/**/*.js'));

  await compile(jsFiles, {
    allowJs: true,
    declaration: true,
    emitDeclarationOnly: true,
  });
}

action();
