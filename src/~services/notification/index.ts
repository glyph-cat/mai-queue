import { IS_CLIENT_ENV } from '@glyph-cat/swiss-army-knife'
import { RelinkSource } from 'react-relink'
import { devError } from '~utils/dev'

export enum NotificationPermission {
  DEFAULT = 'default',
  DENIED = 'denied',
  GRANTED = 'granted',
}

export interface INotificationSource {
  /**
   * Whether or not system permission is granted.
   */
  permission: NotificationPermission
  cache: Record<string, true>
}

const STORAGE_KEY = 'notification'
export const NotificationSource = new RelinkSource<INotificationSource>({
  key: STORAGE_KEY,
  default: {
    permission: NotificationPermission.DEFAULT,
    cache: {},
  },
  lifecycle: typeof window === 'undefined' ? {} : {
    init({ commit, commitNoop, defaultState }) {
      const rawData = localStorage.getItem(STORAGE_KEY)
      if (rawData) {
        try {
          const parsedData = JSON.parse(rawData)
          return commit({
            ...defaultState,
            permission: NotificationPermission.DEFAULT, // TODO: [Low priority] Check from browser again
            ...parsedData,
          }) // Early exit
        } catch (e) {
          devError(e)
        }
      }
      commitNoop()
    },
    didSet({ state }) {
      const { permission, ...remainingState } = state
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remainingState))
    },
    didReset() {
      localStorage.removeItem(STORAGE_KEY)
    },
  }
})

/**
 * @internal
 */
function isPermissionGranted(permission: NotificationPermission): boolean {
  return permission === NotificationPermission.GRANTED
}

export async function checkNotificationPermission(): Promise<boolean> {
  if (!IS_CLIENT_ENV) { return }
  if (!('Notification' in window)) { return }
  const { permission: initialPermission } = await NotificationSource.getAsync()
  if (initialPermission === NotificationPermission.DEFAULT) {
    const newPermission = await Notification.requestPermission() as NotificationPermission
    await NotificationSource.set(s => ({ ...s, permission: newPermission }))
    return isPermissionGranted(newPermission)
  }
  // If already granted or already denied, no need to take further action.
  return isPermissionGranted((await NotificationSource.getAsync()).permission)
}
