import type { IArcadeInfo } from './abstractions'

export const ARCADE_LIST: Array<Omit<IArcadeInfo, 'id'>> = [
  undefined, // Skipped because 0-index is dangerous for data validation
  {
    name: 'FunScape',
    place: 'Lotus @ Bagan Ajam',
    coordinates: {
      latitude: 5.43951,
      longitude: 100.3819734,
      altitude: null,
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
      altitude: null,
    },
    cabinetCount: 2,
    isLegacyVersion: true,
  },
]
