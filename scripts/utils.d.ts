/**
 * Formats a group name for Livingdocs.
 * @param {string} name - The original group name.
 * @returns {string} The formatted group name.
 */
export function lddGroupNames(name: string): string;
/**
 * Reads and caches the package.json file.
 * @returns {Promise<Object>} The parsed package.json object.
 */
export function updatePackageJson(): Promise<any>;
/**
 * Returns the cached package.json object or reads it if not cached.
 * @returns {Promise<Object>} The package.json object.
 */
export function readPackageJson(): Promise<any>;
/**
 * Writes the current package.json object to the file.
 * @returns {Promise<boolean>} True if successful.
 */
export function writePackageJson(): Promise<boolean>;
/**
 * Reads and caches the livingdocs.config.json file.
 * @returns {Promise<Object>} The parsed livingdocs.config.json object.
 */
export function updateLivingDocsJson(): Promise<any>;
/**
 * Returns the cached livingdocs.config.json object or reads it if not cached.
 * @returns {Promise<Object>} The livingdocs.config.json object.
 */
export function readLivingDocsJson(): Promise<any>;
/**
 * Writes the current livingdocs.config.json object to the file.
 * @returns {Promise<boolean>} True if successful.
 */
export function writeLivingDocsJson(): Promise<boolean>;
/**
 * Reads and caches the srl.config.json file.
 * @returns {Promise<Object>} The parsed srl.config.json object.
 */
export function updateNsWowJson(): Promise<any>;
/**
 * Returns the cached srl.config.json object or reads it if not cached.
 * @returns {Promise<Object>} The srl.config.json object.
 */
export function readNsWowJson(): Promise<any>;
/**
 * Writes the current srl.config.json object to the file.
 * @returns {Promise<boolean>} True if successful.
 */
export function writeNsWowJson(): Promise<boolean>;
/**
 * Converts a string to camelCase.
 * @param {string} str - The input string.
 * @returns {string} The camelCase string.
 */
export function camelCase(str: string): string;
/**
 * Gets the version of an npm package.
 * @param {string} packageName - The name of the npm package.
 * @returns {Promise<string>} The package version.
 */
export function getPackageVersion(packageName: string): Promise<string>;
export function deepAssign(target: any, ...sources: any[]): any;
export { writeJson };
