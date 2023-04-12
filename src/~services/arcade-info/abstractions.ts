import { Coord } from '~abstractions'

export interface ArcadeInfo {
  id: string
  name: string
  place: string
  coordinates: Coord
  cabinetCount: number
  isLegacyVersion: boolean
}
