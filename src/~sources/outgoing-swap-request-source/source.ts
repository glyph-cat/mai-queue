import { doc, getDoc } from 'firebase/firestore'
import { RelinkSource } from 'react-relink'
import { SwapRequestStatus } from '~abstractions'
import { Field } from '~constants'
import { DBCollection } from '~services/firebase-client'
import { strictMerge } from '~unstable/strict-merge'
import { devError } from '~utils/dev'
import { IOutgoingSwapRequestSource } from './abstractions'

const STORAGE_KEY = 'outgoing-swap-request'

export const OutgoingSwapRequestSource = new RelinkSource<IOutgoingSwapRequestSource>({
  key: STORAGE_KEY,
  default: null,
  lifecycle: typeof window === 'undefined' ? {} : {
    // NOTE: Need to be able to show popup again if there is ongoing request so
    // popup reappears even after a refresh
    async init({ commit, commitNoop, defaultState }) {
      const rawData = localStorage.getItem(STORAGE_KEY)
      if (rawData) {
        try {
          // TODO: [High priority] Try and see what will happen
          // 1. Send request
          // 2. Close tab
          // 3. Let target player accept request
          // 4. Open back the website
          const parsedData = JSON.parse(rawData)
          const docSnapshot = await getDoc(doc(DBCollection.SwapRequests, parsedData.requestId))
          if (docSnapshot.exists()) {
            const docData = docSnapshot.data()
            if (docData[Field.swapRequestStatus] === SwapRequestStatus.PENDING) {
              return commit(strictMerge(defaultState, parsedData)) // Early exit
            }
          }
        } catch (e) {
          devError(e)
        }
        localStorage.removeItem(STORAGE_KEY)
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
