// This is just a temporary fix

/**
 * Checks if a property exists in an object.
 * @param object The object to check.
 * @param propertyName Name of property to check.
 * @returns A boolean on whether the property exists or not.
 * @example
 * hasProperty({ foo: 'bar' }, 'foo') // true
 * hasProperty({ foo: 'bar' }, 'whooosh') // false
 * @public
 */
export function hasProperty(
  object: unknown,
  propertyName: PropertyKey
): boolean {
  if (!object) { return false } // Early exit
  return Object.prototype.hasOwnProperty.call(object, propertyName)
}
