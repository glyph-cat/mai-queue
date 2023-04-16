// This is copied from '@glyph-cat/swiss-army-knife' because the library contains
// too many unrelated dependencies just for it to work.

/**
 * Get random number between the lower and upper bounds, but excluding the upper
 * bound. The function is designed this way to make it easier to work with,
 * arrays, which indices start from `0` and end at `array.length - 1`.
 * @param lowerBoundInclusive - The smallest possible number.
 * @param upperBoundExclusive - The largest possible number + 1.
 * @returns A random number between the lower and upper bounds, but excluding
 * the upper bound.
 * @example
 * // Generate a random number between 5 to 9.
 * getRandomNumber(5, 10)
 * @example
 * // Generate a random number that is a valid index of the array.
 * getRandomNumber(0, array.length)
 * @public
 */
export function getRandomNumber(
  lowerBoundInclusive: number,
  upperBoundExclusive: number
  // ^ Designed this way to make it easy to use with arrays
): number {
  const padding = upperBoundExclusive - lowerBoundInclusive
  return lowerBoundInclusive + Math.floor(Math.random() * padding)
}


/**
 * Get a random character from a string.
 * @param string - The list of characters to pick from.
 * @returns A random character.
 * @example
 * pickRandom('abcde')
 * @public
 */
export function pickRandom(string: string): string

/**
 * Get a random item from an array.
 * @param items - The list of items to pick from.
 * @returns A random item.
 * @example
 * pickRandom([1, 2, 3, 4, 5])
 * @public
 */
export function pickRandom<T>(items: Array<T> | string): T

/**
 * @public
 */
export function pickRandom<T>(items: Array<T> | string): T | string {
  return items[getRandomNumber(0, items.length)]
}
