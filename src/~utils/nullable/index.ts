import { Nullable } from '@glyph-cat/swiss-army-knife'

export function NullableString(value: string): Nullable<string> {
  return value ? value : null
}

export function NullableTrue(value: boolean): Nullable<true> {
  return value === true || null
}

// export function NullableArray<T>(value: Array<T>): Nullable<Array<T>> {
//   if (value) {
//     return value.length > 0 ? value : null
//   } else {
//     return null
//   }
// }

export function NotZeroOrNull(value: number): Nullable<number> {
  return value !== 0 ? value : null
}

/**
 * Intended to strip away properties where value are `null` to save data
 * transferred between Firestore and this app's server.
 * @deprecated Apparently this doesn't work because indexed fields need to be at
 * least null otherwise they won't work with queries.
 */
export function removeNullProperties<Obj>(object: Obj): Partial<Obj> {
  return object
  // return forEachInObjectToObject(object, ({ key, value, NOTHING }) => {
  //   return isNull(value) ? NOTHING : [key, value]
  // }) as Partial<Obj>
}
