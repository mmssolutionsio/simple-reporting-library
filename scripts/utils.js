import { join } from 'node:path/posix';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { exec } from 'child_process';

const require = createRequire(import.meta.url);

const writeJson = require('write-json');

const data = {
  packageJson: null,
  livingDocsJson: null,
  nsWowJson: null,
}

/**
 * Formats a group name for Livingdocs.
 * @param {string} name - The original group name.
 * @returns {string} The formatted group name.
 */
function lddGroupNames(name) {
  const arrName = name.split('.');
  if (arrName.length > 1) {
    arrName.shift();
    name = arrName.join('.');
  }
  return name.replace('_and_', ' / ').replace('_', ' ');
}

/**
 * Reads and caches the package.json file.
 * @returns {Promise<Object>} The parsed package.json object.
 */
async function updatePackageJson() {
  data.packageJson = JSON.parse(
    await readFileSync(
      join(process.cwd(), 'package.json')
    )
  );
  return data.packageJson;
}

/**
 * Returns the cached package.json object or reads it if not cached.
 * @returns {Promise<Object>} The package.json object.
 */
async function readPackageJson() {
  return data.packageJson || updatePackageJson();
}

/**
 * Writes the current package.json object to the file.
 * @returns {Promise<boolean>} True if successful.
 */
async function writePackageJson() {
  const file = join(process.cwd(), 'package.json');
  await writeJson.sync(file, data.packageJson);
  return true;
}

/**
 * Reads and caches the livingdocs.config.json file.
 * @returns {Promise<Object>} The parsed livingdocs.config.json object.
 */
async function updateLivingDocsJson() {
  data.livingDocsJson = JSON.parse(
    await readFileSync(
      join(process.cwd(), 'livingdocs.config.json')
    )
  );
  return data.livingDocsJson;
}

/**
 * Returns the cached livingdocs.config.json object or reads it if not cached.
 * @returns {Promise<Object>} The livingdocs.config.json object.
 */
async function readLivingDocsJson() {
  return data.livingDocsJson || updateLivingDocsJson();
}

/**
 * Writes the current livingdocs.config.json object to the file.
 * @returns {Promise<boolean>} True if successful.
 */
async function writeLivingDocsJson() {
  const file = join(process.cwd(), 'livingdocs.config.json');
  await writeJson.sync(file, data.livingDocsJson);
  return true;
}

/**
 * Reads and caches the srl.config.json file.
 * @returns {Promise<Object>} The parsed srl.config.json object.
 */
async function updateNsWowJson() {
  data.nsWowJson = JSON.parse(
    await readFileSync(
      join(process.cwd(), 'srl.config.json')
    )
  );
  return data.nsWowJson;
}

/**
 * Returns the cached srl.config.json object or reads it if not cached.
 * @returns {Promise<Object>} The srl.config.json object.
 */
async function readNsWowJson() {
  return data.nsWowJson || updateNsWowJson();
}

/**
 * Writes the current srl.config.json object to the file.
 * @returns {Promise<boolean>} True if successful.
 */
async function writeNsWowJson() {
  const file = join(process.cwd(), 'srl.config.json');
  await writeJson.sync(file, data.nsWowJson);
  return true;
}

/**
 * Converts a string to camelCase.
 * @param {string} str - The input string.
 * @returns {string} The camelCase string.
 */
function camelCase(str) {
  return str.replace(/[._-](\w|$)/g, (_, x) => x.toUpperCase());
}

/**
 * Gets the version of an npm package.
 * @param {string} packageName - The name of the npm package.
 * @returns {Promise<string>} The package version.
 */
function getPackageVersion(packageName) {
  return new Promise((resolve, reject) => {
    exec(`npm view ${packageName} version`, (error, stdout, stderr) => {
      let version = stdout.trim();
      if (version === '') {
        version = '0.0.0';
      }
      resolve(version);
    });
  });
}

export {
  writeJson,
  lddGroupNames,
  updatePackageJson,
  readPackageJson,
  writePackageJson,
  updateLivingDocsJson,
  readLivingDocsJson,
  writeLivingDocsJson,
  updateNsWowJson,
  readNsWowJson,
  writeNsWowJson,
  camelCase,
  getPackageVersion,
};