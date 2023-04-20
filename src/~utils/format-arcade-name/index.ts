import { IArcadeInfo } from '~services/arcade-info'

export function formatArcadeName(
  arcade: Omit<IArcadeInfo, 'id'> & { id?: string }
): string {
  return `${arcade.name} (${arcade.place})`
}
