import { RelinkSource } from 'react-relink'
import { devError } from '~utils/dev'
import { IUserPreferences } from './abstractions'

const STORAGE_KEY = 'user-pref'

export const UserPreferencesSource = new RelinkSource<IUserPreferences>({
  key: STORAGE_KEY,
  default: {
    allowNotifications: false,
  },
  lifecycle: typeof window === 'undefined' ? {} : {
    init({ commit, commitNoop, defaultState }) {
      const rawData = localStorage.getItem(STORAGE_KEY)
      if (rawData) {
        try {
          const parsedData = JSON.parse(rawData)
          return commit({ ...defaultState, ...parsedData }) // Early exit
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
    },
  }
})
