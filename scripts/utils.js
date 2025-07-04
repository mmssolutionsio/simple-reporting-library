import { join } from 'node:path/posix';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
/**
 * A module for writing JSON data to a file.
 *
 * @module writeJson
 */
const writeJson = require('write-json');

/**
 * Replaces underscore (_) placeholders with spaces and replaces '_and_' with a forward slash (/) separator.
 *
 * @param {string} name - The name to modify.
 * @return {string} The modified name with replaced placeholders.
 */
function lddGroupNames(name) {
  return name.replace('_and_', ' / ').replace('_', ' ');
}

/**
 * Reads the contents of the package.json file.
 *
 * @returns {Promise<Object>} A Promise that resolves to the parsed contents of the package.json file.
 */
async function readPackageJson() {
  const file = join(process.cwd(), 'package.json');
  return JSON.parse(await readFileSync(file));
}

/**
 * Writes a package.json file with the given configuration object.
 *
 * @param {Object} config - The configuration object for the package.json file.
 * @return {Boolean} - Returns true if the package.json file is successfully written, else returns false.
 */
async function writePackageJson(config) {
  if (config) {
    const file = join(process.cwd(), 'package.json');
    writeJson.sync(file, config);
  }
  return true;
}

/**
 * Reads the contents of the "livingdocs.config.json" file and returns the parsed JSON.
 *
 * @return {Promise<Object>} A promise that resolves to the parsed JSON from the file.
 */
async function readLivingDocsJson() {
  const file = join(process.cwd(), 'livingdocs.config.json');
  return JSON.parse(await readFileSync(file));
}

/**
 * Writes the given configuration object to a JSON file.
 *
 * @param {Object} config - The configuration object to write.
 * @returns {Promise<boolean>} - A Promise that resolves to true if the file was successfully written, otherwise false.
 */
async function writeLivingDocsJson(config) {
  if (config) {
    const file = join(process.cwd(), 'livingdocs.config.json');
    writeJson.sync(file, config);
  }
  return true;
}

/**
 * Reads the contents of the `nswow.config.json` file and returns the parsed JSON object.
 *
 * @returns {Promise<Object>} - Resolves to the parsed JSON object from the `nswow.config.json` file.
 */
async function readNsWowJson() {
  const file = join(process.cwd(), 'srl.config.json');
  return JSON.parse(await readFileSync(file));
}

/**
 * Writes the given configuration object to an nswow.config.json file.
 * If no configuration object is provided, the method does nothing.
 *
 * @param {Object} config - The configuration object to write.
 *
 * @return {boolean} - Returns true if the configuration was successfully written, otherwise false.
 */
async function writeNsWowJson(config) {
  if (config) {
    const file = join(process.cwd(), 'srl.config.json');
    writeJson.sync(file, config);
  }
  return true;
}
/**
 * Convert a string to camel case notation.
 *
 * @param str - The string to be converted.
 * @returns String in camel case notation.
 */
function camelCase(str) {
  return str.replace(/[._-](\w|$)/g, (_, x) => x.toUpperCase());
}

export {
  writeJson,
  lddGroupNames,
  readPackageJson,
  writePackageJson,
  readLivingDocsJson,
  writeLivingDocsJson,
  readNsWowJson,
  writeNsWowJson,
  camelCase,
};
