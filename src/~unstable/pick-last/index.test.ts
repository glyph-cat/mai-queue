import { pickLast } from '.'

test(pickLast.name, () => {
  expect(pickLast(['a', 'b', 'c'])).toBe('c')
  expect(pickLast([])).toBe(undefined)
})
