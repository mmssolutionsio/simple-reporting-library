import { init } from './scripts/init.js';
import { execSync } from 'child_process';
import { join, resolve } from 'path/posix';
import { rmSync, existsSync, readFileSync, writeFileSync, cpSync } from 'fs';
import { packageName } from './scripts/config.js';
import chalk from 'chalk';

const projectFolder = 'simple-reporting-library-test-project';
const parentPath = resolve(process.cwd(), '..');
const projectPath = join(parentPath, projectFolder);
const packageJsonPath = join(projectPath, 'package.json');
const testDataPath = resolve(process.cwd(), 'test-data');
const publicPath = join(projectPath, 'public');

const msg = {
  info: (text) => chalk.black.bgYellowBright.bold(` INFO: ${text} `),
  action: (text) => chalk.black.bgBlueBright.bold(` ACTION: ${text} `),
  error: (text) => chalk.black.bgRedBright.bold(` ERROR: ${text} `),
  success: (text) => chalk.black.bgGreenBright.bold(` SUCCESS: ${text} `),
};

if (existsSync(projectPath)) {
  console.log(msg.info(`Deleting folder: ${projectFolder}`));
  rmSync(projectPath, { recursive: true, force: true });
}

process.chdir(parentPath);

console.log(msg.action(`Initializing project in ${projectFolder}...`));
init(projectFolder)
  .then(() => {
    console.log(msg.info(`Project ${projectFolder} initialized successfully.`));

    if (existsSync(testDataPath)) {
      console.log(msg.action('Copying test-data to public folder...'));
      cpSync(testDataPath, publicPath, { recursive: true, force: true });
      console.log(msg.success('test-data copied successfully.'));
    } else {
      console.log(msg.info('No test-data folder found.'));
    }

    if (existsSync(packageJsonPath)) {
      console.log(msg.action('Updating package.json...'));
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

      if (packageJson.dependencies && packageJson.dependencies[packageName]) {
        packageJson.dependencies[packageName] =
          'file:../simple-reporting-library';
        writeFileSync(
          packageJsonPath,
          JSON.stringify(packageJson, null, 2),
          'utf-8',
        );
        console.log(msg.success(`Updated ${packageName} in package.json.`));
      } else {
        console.log(msg.error(`${packageName} not found in devDependencies.`));
      }
    } else {
      console.error(msg.error('package.json not found.'));
    }

    console.log(msg.action('Initializing a new Git repository...'));
    execSync('git init', { cwd: projectPath, stdio: 'inherit' });
    console.log(msg.success('Git repository initialized.'));

    console.log(msg.action('Running npm install...'));
    execSync('npm install', { cwd: projectPath, stdio: 'inherit' });
    console.log(msg.success('npm install completed.'));

    console.log(msg.action('Adding all files to Git...'));
    execSync('git add .', { cwd: projectPath, stdio: 'inherit' });
    console.log(msg.success('All files added to Git.'));

    console.log(msg.action('Creating initial commit...'));
    execSync('git commit -m "init"', { cwd: projectPath, stdio: 'inherit' });
    console.log(msg.success('Initial commit created.'));

    console.log('');

    console.log(
      msg.success(`
---------------------------------------------------------------------
Project initialization completed successfully.
You can now navigate to the project folder: 
${projectPath}
---------------------------------------------------------------------`),
    );
  })
  .catch((error) => {
    console.error(msg.error('Error initializing project:'), error);
  });
