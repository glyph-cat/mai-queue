import { IArcadeInfo } from '~services/arcade-info'
import { formatArcadeName } from '.'

test(formatArcadeName.name, () => {
  const arcade: IArcadeInfo = {
    id: null,
    name: 'Imaginary Arcade',
    place: 'Example Mall',
    coordinates: null,
    cabinetCount: null,
    isLegacyVersion: false,
  }
  expect(formatArcadeName(arcade)).toBe('Imaginary Arcade (Example Mall)')
})
