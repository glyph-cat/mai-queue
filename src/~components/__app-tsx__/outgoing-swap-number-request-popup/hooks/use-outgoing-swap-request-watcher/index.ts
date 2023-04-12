import { doc, onSnapshot } from 'firebase/firestore'
import { useEffect } from 'react'
import { SwapRequestStatus } from '~abstractions'
import { Field } from '~constants'
import { DBCollection } from '~services/firebase-client'

export function useOutgoingSwapRequestWatcher(
  currentQueueLength: number,
  requestId: string,
  onRequestAccepted: () => void,
  onRequestDeclined: () => void,
): void {
  useEffect(() => {
    if (!requestId || currentQueueLength <= 0) { return }
    const unsubscribeListener = onSnapshot(doc(
      DBCollection.SwapRequests,
      requestId
    ), (snapshot) => {
      const snapshotData = snapshot.data()
      if (snapshotData[Field.swapRequestStatus] === SwapRequestStatus.ACCEPTED) {
        onRequestAccepted()
      } else if (snapshotData[Field.swapRequestStatus] === SwapRequestStatus.DECLINED) {
        onRequestDeclined()
      }
    })
    return () => { unsubscribeListener() }
  }, [currentQueueLength, onRequestAccepted, onRequestDeclined, requestId])
}
