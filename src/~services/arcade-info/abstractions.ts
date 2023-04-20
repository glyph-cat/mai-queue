import { ICoordinate } from '~abstractions'

export interface IArcadeInfo {
  id: string
  name: string
  place: string
  coordinates: ICoordinate
  cabinetCount: number
  isLegacyVersion: boolean
}
