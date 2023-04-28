export function pickLast<T>(array: Array<T>): T {
  return array[Math.max(0, array.length - 1)]
}
