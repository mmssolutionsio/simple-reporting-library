/**
 * Converts an array or a string to a string representation with elements separated by a specified separator.
 *
 * @param {String|String[]} data - The array or string to be converted.
 * @param {String} [separator='-'] - The separator to be used between elements. Defaults to '-' if not provided.
 *
 * @return {String} - The string representation of the input data with elements separated by the specified separator.
 */
function ArrayToString(data: string | any[], separator: string = '-'): string {
  return Array.isArray(data) ? data.join(separator) : data
}

export { ArrayToString }
