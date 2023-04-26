import { forEachInObjectToObject } from '@glyph-cat/swiss-army-knife'

/**
 * Similar to ordinary spread, except the final output object will only contain
 * properties that are present in the defaultObject.
 * @param defaultObject - The template object.
 * @param objectsToMerge - The other objects to spread on top of the default one.
 * @returns The merged object.
 */
export function strictMerge<T>(defaultObject: T, ...objectsToMerge: Array<unknown>): T {
  let finalObject: T = defaultObject
  for (const objectToMerge of objectsToMerge) {
    const sanitizedObject = forEachInObjectToObject(defaultObject, ({ key, NOTHING }) => {
      if (objectToMerge[key]) {
        return [key, objectToMerge[key]]
      } else {
        return NOTHING
      }
    }) as Partial<T>
    finalObject = { ...finalObject, ...sanitizedObject }
  }
  return finalObject
}
