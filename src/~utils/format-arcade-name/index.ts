import { ArcadeInfo } from '~services/arcade-info'

export function formatArcadeName(
  arcade: Omit<ArcadeInfo, 'id'> & { id?: string }
): string {
  return `${arcade.name} (${arcade.place})`
}
