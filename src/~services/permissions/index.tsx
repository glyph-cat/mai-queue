import { CustomDialog } from '~components/custom-dialog'
import { PROJECT_NAME } from '~constants'
import {
  PermissionStatus,
  PermissionType,
  getPermissionStatus,
  setPermissionStatus,
} from '~sources/permissions'

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => { resolve(position) },
      (positionError) => { reject(positionError) }
    )
    setTimeout(() => { reject() }, 3000)
  })
}

export async function askForGeolocationPermission(): Promise<void> {
  const permissionStatus = await getPermissionStatus(PermissionType.GEOLOCATION)
  try {
    if (permissionStatus === PermissionStatus.PROMPT) {
      await CustomDialog.alert(
        <>{PROJECT_NAME}{' needs to know your '}<b>location</b></>,
        'This helps make sure tickets can only be taken at the arcade. You will be prompted by the browser after this.',
        { okText: 'Next' }
      )
    }
    if (navigator.geolocation) {
      await getCurrentPosition()
      await setPermissionStatus(PermissionType.GEOLOCATION, PermissionStatus.GRANTED)
    } else {
      await setPermissionStatus(PermissionType.GEOLOCATION, PermissionStatus.UNSUPPORTED_OR_UNAVAILABLE)
      return // Early exit
    }
  } catch (e) {
    if (e instanceof GeolocationPositionError) {
      if (e.code === GeolocationPositionError.PERMISSION_DENIED) {
        await setPermissionStatus(PermissionType.GEOLOCATION, PermissionStatus.DENIED)
      }
    } else {
      await setPermissionStatus(PermissionType.GEOLOCATION, PermissionStatus.UNSUPPORTED_OR_UNAVAILABLE)
    }
  }
}

export async function askForNotificationPermission(): Promise<void> {
  // Check for API availability
  // Check if previously already asked
}
