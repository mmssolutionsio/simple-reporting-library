/**
 * `uuid.ts`
 *
 * This utility module provides a simple sequential UUID generator.
 * It maintains a counter that increments with each call to generate
 * unique string identifiers in the format "uuid-X".
 *
 * ## Variables
 * - `id`: Module-level counter that starts at 0 and increments with each UUID generation
 *
 * ## Function: getUuid
 * - Returns a unique string identifier
 * - Generates IDs in the format "uuid-X" where X is an incrementing number
 * - Each call to the function produces a different ID by incrementing the counter
 * - The counter persists across multiple calls within the same application instance
 *
 * ## Return Value
 * - String: A unique identifier in the format "uuid-X"
 *
 * ## Usage Example
 * ```typescript
 * import getUuid from '@/composables/uuid'
 *
 * const elementId = getUuid() // "uuid-0"
 * const anotherId = getUuid() // "uuid-1"
 *
 * // Use as HTML element IDs
 * const labelId = getUuid()
 * element.setAttribute('id', labelId)
 */
let id = 0

export default function getUuid() {
  return `uuid-${id++}`
}