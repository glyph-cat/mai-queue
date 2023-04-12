import type { ArcadeInfo } from './abstractions'

export const ARCADE_LIST: Array<Omit<ArcadeInfo, 'id'>> = [
  undefined, // Skipped because 0-index is dangerous in data validation
  {
    name: 'FunScape',
    place: 'Lotus @ Bagan Ajam',
    coordinates: {
      latitude: 5.43951,
      longitude: 100.3819734,
      altitude: 17,
    },
    cabinetCount: 2,
    isLegacyVersion: false,
  },
  {
    name: 'KB Fun',
    place: 'First Avenue',
    coordinates: {
      latitude: 5.4135192,
      longitude: 100.3298402,
      altitude: 17.78,
    },
    cabinetCount: 2,
    isLegacyVersion: true,
  },
]
