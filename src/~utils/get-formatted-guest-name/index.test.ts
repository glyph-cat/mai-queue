import { getFormattedGuestName } from '.'

test(getFormattedGuestName.name, () => {
  expect(getFormattedGuestName(1)).toBe('GUEST 02')
  expect(getFormattedGuestName(42)).toBe('GUEST 42')
})
