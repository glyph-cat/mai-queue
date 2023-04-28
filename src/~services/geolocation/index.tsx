import { useEffect, useState } from 'react'
import { useRelinkValue } from 'react-relink'
import { ENV, VercelEnv } from '~constants'
import { useArcadeInfo } from '~services/arcade-info'
import { askForGeolocationPermission } from '~services/permissions'
import { DebugConfigSource } from '~sources/debug'
import { GeolocationPositionSource } from '~sources/geolocation'
import { checkIfCoordIsWithinRadius } from '~utils/coords-intersection'

export function useGeolocationPositionRoot(): void {
  const [hasPermissionOrAPISupported, setState] = useState(false)
  useEffect(() => {
    askForGeolocationPermission().then((allowed) => {
      setState(allowed)
    })
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
