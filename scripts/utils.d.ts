/**
 * Replaces underscore (_) placeholders with spaces and replaces '_and_' with a forward slash (/) separator.
 *
 * @param {string} name - The name to modify.
 * @return {string} The modified name with replaced placeholders.
 */
export function lddGroupNames(name: string): string;
/**
 * Reads the contents of the package.json file.
 *
 * @returns {Promise<Object>} A Promise that resolves to the parsed contents of the package.json file.
 */
export function readPackageJson(): Promise<any>;
/**
 * Writes a package.json file with the given configuration object.
 *
 * @param {Object} config - The configuration object for the package.json file.
 * @return {Boolean} - Returns true if the package.json file is successfully written, else returns false.
 */
export function writePackageJson(config: any): boolean;
/**
 * Reads the contents of the "livingdocs.config.json" file and returns the parsed JSON.
 *
 * @return {Promise<Object>} A promise that resolves to the parsed JSON from the file.
 */
export function readLivingDocsJson(): Promise<any>;
/**
 * Writes the given configuration object to a JSON file.
 *
 * @param {Object} config - The configuration object to write.
 * @returns {Promise<boolean>} - A Promise that resolves to true if the file was successfully written, otherwise false.
 */
export function writeLivingDocsJson(config: any): Promise<boolean>;
/**
 * Reads the contents of the `nswow.config.json` file and returns the parsed JSON object.
 *
 * @returns {Promise<Object>} - Resolves to the parsed JSON object from the `nswow.config.json` file.
 */
export function readNsWowJson(): Promise<any>;
/**
 * Writes the given configuration object to an nswow.config.json file.
 * If no configuration object is provided, the method does nothing.
 *
 * @param {Object} config - The configuration object to write.
 *
 * @return {boolean} - Returns true if the configuration was successfully written, otherwise false.
 */
export function writeNsWowJson(config: any): boolean;
/**
 * Convert a string to camel case notation.
 *
 * @param str - The string to be converted.
 * @returns String in camel case notation.
 */
export function camelCase(str: any): any;
export function getPackageVersion(packageName: any): Promise<any>;
export { writeJson };
