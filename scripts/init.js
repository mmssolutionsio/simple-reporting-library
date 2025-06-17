import { dirname, join } from 'node:path';
import fs from 'fs-extra';
import { statSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const { Input } = require('enquirer');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/**
 * Initializes a new project in the given folder with the provided options.
 *
 * @param {string} folder - The path to the folder where the project will be created.
 * @param {object} options - Additional options for the initialization process.
 *
 * @return {Promise<void>} - A promise that resolves when the project initialization is complete.
 */
async function init(folder, options) {

  const prompt = new Input({
    message: 'Project name',
    initial: folder,
  });
  let projectName = await prompt.run();
  if (projectName === '') {
    projectName = folder;
  }

  const projectPath = join( process.cwd(), folder );

  try {
    const stat = statSync(projectPath);
    console.error(`Folder ${projectPath} already exist!`);
  } catch (e) {
    await fs.copy(join(__dirname, '..' , 'dev'), projectPath).then(async () => {
      const packageJsonFile = join(projectPath, 'package.json');
      const packageJson = JSON.parse(await readFileSync(packageJsonFile));
      packageJson.name = projectName;
      const writeJson = require('write-json');
      writeJson.sync(packageJsonFile, packageJson);

      await writeFileSync(
        `${projectPath}/.gitignore`,
        `/.output/\n/.srl/\n/node_modules/\n/public/downloads/\n/public/html/\n/public/images/\n/public/json/\n/public/exclude/\n/dev-dist/`,
      );
      console.log(`Project has created`);
      console.log(`cd ${folder}`);
      console.log(`npm install`);
    });
  }
}

export { init };
