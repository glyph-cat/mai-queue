import { isSQLFormattedDatetimeString } from '.'

describe(isSQLFormattedDatetimeString.name, (): void => {

  test('Valid formats', (): void => {
    expect(isSQLFormattedDatetimeString('2014-07-13 00:00:00.000 Z')).toBe(true)
    expect(isSQLFormattedDatetimeString('2014-07-13 00:00:00.000')).toBe(true)
    expect(isSQLFormattedDatetimeString('2014-07-13 00:00:00')).toBe(true)
    expect(isSQLFormattedDatetimeString('2014-07-13')).toBe(true)
  })

  test('Invalid formats', (): void => {
    expect(isSQLFormattedDatetimeString('2014 July 13')).toBe(false)
    expect(isSQLFormattedDatetimeString('2014/07/13')).toBe(false)
    expect(isSQLFormattedDatetimeString('')).toBe(false)
  })

})
