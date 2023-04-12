import { hasProperty } from '.'

describe(hasProperty.name, (): void => {

  const $internals = Symbol()
  const SAMPLE_OBJECT = {
    foo: 1,
    bar: undefined,
    7: 'seven',
    [$internals]: {},
  } as const

  test('Does exist', (): void => {
    expect(hasProperty(SAMPLE_OBJECT, 'foo')).toBe(true)
    expect(hasProperty(SAMPLE_OBJECT, 7)).toBe(true)
    expect(hasProperty(SAMPLE_OBJECT, $internals)).toBe(true)
  })

  test('Does exist, but undefined', (): void => {
    expect(hasProperty(SAMPLE_OBJECT, 'bar')).toBe(true)
  })

  test('Does not exist', (): void => {
    expect(hasProperty(SAMPLE_OBJECT, 'baz')).toBe(false)
  })

  test('Non-object types', (): void => {
    expect(hasProperty(null, 'foo')).toBe(false)
    expect(hasProperty(undefined, 'foo')).toBe(false)
    expect(hasProperty(42, 'foo')).toBe(false)
    expect(hasProperty(42, 'toString')).toBe(true)
  })

})
