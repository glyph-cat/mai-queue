import { RelinkSource } from 'react-relink'
import { ExtendedGeolocationPosition } from './abstractions'

export const GeolocationPositionSource = new RelinkSource<ExtendedGeolocationPosition>({
  key: 'geolocation-position',
  default: {
    isUserEnabled: null,
    error: null,
    timestamp: null,
    coords: {
      accuracy: 0,
      altitude: 0,
      altitudeAccuracy: null,
      heading: null,
      latitude: 0,
      longitude: 0,
      speed: null,
    },
  },
})
