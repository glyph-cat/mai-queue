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
  })
}

export async function askForGeolocationPermission(): Promise<void> {
  if (!navigator.geolocation) {
    await setPermissionStatus(PermissionType.GEOLOCATION, PermissionStatus.UNSUPPORTED)
    return // Early exit
  }
  const permissionStatus = await getPermissionStatus(PermissionType.GEOLOCATION)
  if (permissionStatus !== PermissionStatus.PROMPT) {
    return null // Early exit
  }
  try {
    await CustomDialog.alert(
      `Info: ${PROJECT_NAME} requires GPS access to function`,
      <>
        {'This is to ensure that players can only take tickets at the arcade to keep things fair.'}
        <br />
        {'You will be prompted by the browser after this.'}
      </>,
    )
    await getCurrentPosition()
    await setPermissionStatus(PermissionType.GEOLOCATION, PermissionStatus.GRANTED)
  } catch (e) {
    await setPermissionStatus(PermissionType.GEOLOCATION, PermissionStatus.DENIED)
  }
}

export async function askForNotificationPermission(): Promise<void> {
  // Check for API availability
  // Check if previously already asked
}
