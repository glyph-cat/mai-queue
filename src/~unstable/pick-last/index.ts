export function pickLast<T>(array: Array<T>): T {
  // if (!Array.isArray(array)) { return undefined }
  return array[Math.max(0, array.length - 1)]
}
