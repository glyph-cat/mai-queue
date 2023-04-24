import { fullyEnumerate } from '.'

describe(fullyEnumerate.name, () => {

  describe('Proof of concept', () => {

    test('Enum with numeric values', () => {
      enum SomeEnum {
        FOO = 1,
        BAR
      }
      expect(SomeEnum.FOO).toBe(1)
      expect(SomeEnum.BAR).toBe(2)
      expect(SomeEnum[SomeEnum.FOO]).toBe('FOO')
      expect(SomeEnum[SomeEnum.BAR]).toBe('BAR')
    })

    test('Enum with string values', () => {
      enum SomeEnum {
        FOO = 'a',
        BAR = 'b',
      }
      expect(SomeEnum.FOO).toBe('a')
      expect(SomeEnum.BAR).toBe('b')
      expect(SomeEnum[SomeEnum.FOO]).toBe(undefined)
      expect(SomeEnum[SomeEnum.BAR]).toBe(undefined)
      SomeEnum[SomeEnum.FOO] = 'FOO'
      SomeEnum[SomeEnum.BAR] = 'BAR'
      expect(SomeEnum[SomeEnum.FOO]).toBe('FOO')
      expect(SomeEnum[SomeEnum.BAR]).toBe('BAR')
    })

  })

  test('Main', () => {
    enum SomeEnum {
      FOO = 'a',
      BAR = 'b',
    }
    expect(SomeEnum.FOO).toBe('a')
    expect(SomeEnum.BAR).toBe('b')
    expect(SomeEnum[SomeEnum.FOO]).toBe(undefined)
    expect(SomeEnum[SomeEnum.BAR]).toBe(undefined)
    fullyEnumerate(SomeEnum)
    expect(SomeEnum[SomeEnum.FOO]).toBe('FOO')
    expect(SomeEnum[SomeEnum.BAR]).toBe('BAR')
  })
})
