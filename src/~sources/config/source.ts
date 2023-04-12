import { devError } from '@glyph-cat/swiss-army-knife'
import { RelinkSource } from 'react-relink'
import { IConfigSource } from './abstractions'

const STORAGE_KEY = 'config'

export const ConfigSource = new RelinkSource<IConfigSource>({
  key: STORAGE_KEY,
  default: {
    deviceKey: null,
    friendCode: '',
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
  },
})
