/**
 * Convert a string to camel case notation.
 *
 * @private
 * @category Utils
 * @param str - The string to be converted.
 * @returns String in camel case notation.
 */
export function camelCase(str: string): string {
  return str.replace(/[._-](\w|$)/g, (_, x) => (x as string).toUpperCase());
}
