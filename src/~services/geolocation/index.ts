import { useEffect } from 'react'
import { RelinkSource, useRelinkValue } from 'react-relink'

let __hookCounter__ = 0

const GeolocationPositionHooksSource = new RelinkSource<Record<string, true>>({
  key: 'geolocation-position/hooks',
  default: {},
})

export interface ExtendedGeolocationPosition extends GeolocationPosition {
  isUserEnabled: boolean
  error: GeolocationPositionError
}

// TODO: [High priority] Use hook coordinator instead

const GeolocationPositionSource = new RelinkSource<ExtendedGeolocationPosition>({
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

export function useGeolocationPositionRoot(): void {
  const geolocationPositionHooksCount = useRelinkValue(
    GeolocationPositionHooksSource,
    (s) => Object.keys(s).length
  )
  useEffect(() => {
    if (geolocationPositionHooksCount <= 0) { return }
    if (!navigator.geolocation) { return }
    const watchId = navigator.geolocation.watchPosition((position: GeolocationPosition) => {
      GeolocationPositionSource.set({
        timestamp: position.timestamp,
        coords: position.coords,
        error: null,
        isUserEnabled: true,
      })
    }, (positionError: GeolocationPositionError) => {
      GeolocationPositionSource.set((s) => ({ ...s, error: positionError }))
    }, {
      enableHighAccuracy: true,
    })
    return () => { navigator.geolocation.clearWatch(watchId) }
  }, [geolocationPositionHooksCount])
}

export function useGeolocationPosition(): ExtendedGeolocationPosition {
  useEffect(() => {
    const hookId = ++__hookCounter__
    GeolocationPositionHooksSource.set((s) => ({ ...s, [hookId]: true }))
    return () => {
      GeolocationPositionHooksSource.set((existingHooks) => {
        const { [hookId]: _toIgnore, ...nextHooks } = existingHooks
        return nextHooks
      })
    }
  }, [])
  return useRelinkValue(GeolocationPositionSource)
}
