import { isString } from '@glyph-cat/swiss-army-knife'
import { Timestamp } from 'firebase/firestore'
import { DateTime } from 'luxon'
import { isFalsy, isSQLFormattedDatetimeString } from '../__shared__'

/**
 * @returns A Luxon `Datetime` instance, or `null` if the value is `null`.
 */
export function safelyConvertToLuxonDatetime(value: unknown): DateTime {
  if (isString(value) && isSQLFormattedDatetimeString(value)) {
    return DateTime.fromSQL(value)
  } else if (value instanceof Date) {
    return DateTime.fromJSDate(value)
  } else if (value instanceof Timestamp) {
    return DateTime.fromJSDate(value.toDate())
  } else if (DateTime.isDateTime(value)) {
    return value
  } else if (isFalsy(value)) {
    return null
  } else {
    throw new TypeError(`Failed to convert to Datetime. Invalid type: ${typeof value}`)
  }
}

/**
 * @returns A Firestore `Timestamp` instance, or `null` if the value is `null`.
 */
export function safelyConvertToFirestoreTimestamp(value: unknown): Timestamp {
  if (isString(value) && isSQLFormattedDatetimeString(value)) {
    return Timestamp.fromDate(DateTime.fromSQL(value).toJSDate())
  } else if (value instanceof Date) {
    return Timestamp.fromDate(value)
  } else if (value instanceof DateTime) {
    return Timestamp.fromDate(value.toJSDate())
  } else if (value instanceof Timestamp) {
    return value
  } else if (isFalsy(value)) {
    return null
  } else {
    throw new TypeError(`Failed to convert to Timestamp. Invalid type: ${typeof value}`)
  }
}

/**
 * @returns A SQL-formatted date string or `null` if the value is `null`.
 */
export function safelyConvertToSQLDatetimeString(value: unknown): string {
  if (value instanceof Date) {
    return DateTime.fromJSDate(value).toSQL()
  } else if (value instanceof DateTime) {
    return value.toSQL()
  } else if (value instanceof Timestamp) {
    return DateTime.fromJSDate(value.toDate()).toSQL()
  } else if (isString(value) && isSQLFormattedDatetimeString(value)) {
    return value
  } else if (isFalsy(value)) {
    return null
  } else {
    throw new TypeError(`Failed to convert to SQL date. Invalid type: ${typeof value}`)
  }
}

export * from '../__shared__'
