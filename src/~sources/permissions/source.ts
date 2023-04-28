import { RelinkSource } from 'react-relink'
import { strictMerge } from '~unstable/strict-merge'
import { devError } from '~utils/dev'
import {
  PermissionCollection,
  PermissionStatus,
  PermissionType,
} from './abstractions'

const STORAGE_KEY = 'permissions'

/**
 * Keeps track of whether permissions for certain features have been asked.
 */
export const PermissionsSource = new RelinkSource<PermissionCollection>({
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
