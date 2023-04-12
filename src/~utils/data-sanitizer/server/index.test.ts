import { isString } from '@glyph-cat/swiss-army-knife'
import { Timestamp } from '@google-cloud/firestore'
import { DateTime } from 'luxon'
import {
  safelyConvertToFirestoreTimestamp,
  safelyConvertToLuxonDatetime,
  safelyConvertToSQLDatetimeString,
} from '.'

describe(safelyConvertToFirestoreTimestamp.name, (): void => {

  test('Valid types', (): void => {
    expect(safelyConvertToFirestoreTimestamp(DateTime.now()) instanceof Timestamp).toBe(true)
    expect(safelyConvertToFirestoreTimestamp(new Date()) instanceof Timestamp).toBe(true)
    expect(safelyConvertToFirestoreTimestamp(Timestamp.now()) instanceof Timestamp).toBe(true)
    expect(safelyConvertToFirestoreTimestamp(false)).toBeNull()
    expect(safelyConvertToFirestoreTimestamp(undefined)).toBeNull()
    expect(safelyConvertToFirestoreTimestamp(null)).toBeNull()
    expect(safelyConvertToFirestoreTimestamp(0)).toBeNull()
  })

  test('Invalid types', (): void => {
    expect(() => { safelyConvertToFirestoreTimestamp({}) }).toThrow(TypeError)
  })

})

describe(safelyConvertToLuxonDatetime.name, (): void => {

  test('Valid types', (): void => {
    expect(safelyConvertToLuxonDatetime(DateTime.now()) instanceof DateTime).toBe(true)
    expect(safelyConvertToLuxonDatetime(new Date()) instanceof DateTime).toBe(true)
    expect(safelyConvertToLuxonDatetime(Timestamp.now()) instanceof DateTime).toBe(true)
    expect(safelyConvertToLuxonDatetime('')).toBeNull()
    expect(safelyConvertToLuxonDatetime(false)).toBeNull()
    expect(safelyConvertToLuxonDatetime(undefined)).toBeNull()
    expect(safelyConvertToLuxonDatetime(null)).toBeNull()
    expect(safelyConvertToLuxonDatetime(0)).toBeNull()
  })

  test('Invalid types', (): void => {
    expect(() => { safelyConvertToLuxonDatetime({}) }).toThrow(TypeError)
  })

})

describe(safelyConvertToSQLDatetimeString.name, (): void => {

  test('Valid types', (): void => {
    expect(isString(safelyConvertToSQLDatetimeString(DateTime.now()))).toBe(true)
    expect(isString(safelyConvertToSQLDatetimeString(new Date()))).toBe(true)
    expect(isString(safelyConvertToSQLDatetimeString(Timestamp.now()))).toBe(true)
    expect(safelyConvertToSQLDatetimeString('')).toBeNull()
    expect(safelyConvertToSQLDatetimeString(false)).toBeNull()
    expect(safelyConvertToSQLDatetimeString(undefined)).toBeNull()
    expect(safelyConvertToSQLDatetimeString(null)).toBeNull()
    expect(safelyConvertToSQLDatetimeString(0)).toBeNull()
  })

  test('Invalid types', (): void => {
    expect(() => { safelyConvertToSQLDatetimeString({}) }).toThrow(TypeError)
  })

})
