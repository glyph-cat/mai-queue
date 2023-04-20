import { NotZeroOrNull, NullableString, NullableTrue } from '.'

test(NullableString.name, () => {
  expect(NullableString('someValue')).toBe('someValue')
  expect(NullableString('')).toBe(null)
  expect(NullableString(null)).toBe(null)
  expect(NullableString(undefined)).toBe(null)
})

test(NullableTrue.name, () => {
  expect(NullableTrue(true)).toBe(true)
  expect(NullableTrue(false)).toBe(null)
  expect(NullableTrue(null)).toBe(null)
  expect(NullableTrue(undefined)).toBe(null)
})

test(NotZeroOrNull.name, () => {
  expect(NotZeroOrNull(1)).toBe(1)
  expect(NotZeroOrNull(0)).toBe(null)
  expect(NotZeroOrNull(null)).toBe(null)
  expect(NotZeroOrNull(undefined)).toBe(null)
})
