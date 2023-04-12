export function isFalsy(value: unknown): boolean {
  return !value
}

/**
 * @returns `true` if the string matches an SQL datetime format, otherwise `false`.
 */
export function isSQLFormattedDatetimeString(value: string): boolean {
  const sqlDatetimePattern = /^\d{4}-\d{2}-\d{2}(\s\d{2}:\d{2}:\d{2}(\.\d{3})?)?/
  return sqlDatetimePattern.test(value)
}
