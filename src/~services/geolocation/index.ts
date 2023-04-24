import { useEffect } from 'react'
import { RelinkSource, useRelinkValue } from 'react-relink'
import { ENV } from '~constants'
import { useArcadeInfo } from '~services/arcade-info'
import { DebugConfigSource } from '~sources/debug'
import { DataSubscriptionHookCoordinator } from '~unstable/hook-coordinator'
import { checkIfCoordIsWithinRadius } from '~utils/coords-intersection'

export interface ExtendedGeolocationPosition extends GeolocationPosition {
  isUserEnabled: boolean
  error: GeolocationPositionError
}

const { useAsConsumer, useAsProvider } = new DataSubscriptionHookCoordinator()

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
  const shouldBeActive = useAsProvider()
  useEffect(() => {
    if (!shouldBeActive) { return }
    if (!navigator.geolocation) { return }
    const watchId = navigator.geolocation.watchPosition(async (position: GeolocationPosition) => {
      await GeolocationPositionSource.set({
        timestamp: position.timestamp,
        coords: position.coords,
        error: null,
        isUserEnabled: true,
      })
    }, (positionError: GeolocationPositionError) => {
      GeolocationPositionSource.set(s => ({ ...s, error: positionError }))
    }, {
      enableHighAccuracy: true,
    })
    return () => { navigator.geolocation.clearWatch(watchId) }
  }, [shouldBeActive])
}

export function useGeolocationPosition(active = true): ExtendedGeolocationPosition {
  useAsConsumer(active)
  return useRelinkValue(GeolocationPositionSource, null, active)
}

/**
 * @returns `true` if self is near arcade.
 */
export function useGeolocationChecking(): boolean {
  const { disableGeoChecking } = useRelinkValue(DebugConfigSource)
  const currentArcade = useArcadeInfo()
  const geolocationPosition = useGeolocationPosition(!disableGeoChecking)
  if (ENV.VERCEL_ENV !== 'production' && disableGeoChecking) {
    return true
  } else {
    return checkIfCoordIsWithinRadius(
      geolocationPosition.coords,
      currentArcade.coordinates,
      300
    )
  }
}
