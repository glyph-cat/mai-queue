import { RelinkSource } from 'react-relink'
import { CustomDialog } from '~components/custom-dialog'
import { PROJECT_NAME } from '~constants'
import { strictMerge } from '~unstable/strict-merge'
import { devError } from '~utils/dev'

export enum PermissionType {
  GEOLOCATION = 1,
  NOTIFICATION,
}

export enum PermissionStatus {
  PROMPT = 1,
  GRANTED,
  DENIED,
  UNSUPPORTED,
}

const STORAGE_KEY = 'permissions'

/**
 * Keeps track of whether permissions for certain features have been asked.
 */
export const PermissionsSource = new RelinkSource<Record<PermissionType, PermissionStatus>>({
  key: STORAGE_KEY,
  default: {
    [PermissionType.GEOLOCATION]: PermissionStatus.PROMPT,
    [PermissionType.NOTIFICATION]: PermissionStatus.PROMPT,
  },
  lifecycle: typeof window === 'undefined' ? {} : {
    init({ commit, commitNoop, defaultState }) {
      const rawData = localStorage.getItem(STORAGE_KEY)
      if (rawData) {
        try {
          const parsedData = JSON.parse(rawData)
          return commit(strictMerge(defaultState, parsedData)) // Early exit
        } catch (e) {
          devError(e)
        }
      }
      commitNoop()
    },
    didSet({ state }) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    },
    didReset() {
      localStorage.removeItem(STORAGE_KEY)
    }
  },
})

async function setPermissionStatus(
  type: PermissionType,
  status: PermissionStatus
): Promise<void> {
  await PermissionsSource.set(s => ({ ...s, [type]: status }))
}

async function getPermissionStatus(type: PermissionType): Promise<PermissionStatus> {
  return (await PermissionsSource.getAsync())[type]
}

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
