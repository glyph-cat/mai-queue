import { useEffect, useState } from 'react'
import { RelinkSource, useRelinkValue } from 'react-relink'
import { ENV, VercelEnv } from '~constants'
import { useArcadeInfo } from '~services/arcade-info'
import { askForGeolocationPermission } from '~services/permissions'
import { DebugConfigSource } from '~sources/debug'
import { checkIfCoordIsWithinRadius } from '~utils/coords-intersection'

export interface ExtendedGeolocationPosition extends GeolocationPosition {
  isUserEnabled: boolean
  error: GeolocationPositionError
}

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

export function useGeolocationPositionRoot(): void {
  const [hasPermissionOrAPISupported, setState] = useState(false)
  useEffect(() => {
    askForGeolocationPermission()
    setState(true)
  }, [])
  useEffect(() => {
    if (!hasPermissionOrAPISupported) { return }
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
  }, [hasPermissionOrAPISupported])
}

/**
 * @returns `true` if self is near arcade.
 */
export function useGeolocationChecking(): boolean {
  const { disableGeoChecking } = useRelinkValue(DebugConfigSource)
  const currentArcade = useArcadeInfo()
  const geolocationPosition = useRelinkValue(GeolocationPositionSource)
  if (ENV.VERCEL_ENV !== VercelEnv.PRODUCTION && disableGeoChecking) {
    return true
  } else {
    return checkIfCoordIsWithinRadius(
      geolocationPosition.coords,
      currentArcade.coordinates,
      300
    )
  }
}
