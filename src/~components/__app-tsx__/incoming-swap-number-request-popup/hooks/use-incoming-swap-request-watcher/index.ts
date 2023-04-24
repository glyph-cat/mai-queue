import { doc, limit, onSnapshot, query, where } from 'firebase/firestore'
import { useEffect } from 'react'
import { useRelinkValue } from 'react-relink'
import { SwapRequestStatus } from '~abstractions'
import { CustomDialog } from '~components/custom-dialog'
import { Field, MAX_ALLOWED_SWAP_REQUEST_RETRY_COUNT } from '~constants'
import { useArcadeInfo } from '~services/arcade-info'
import { DBCollection } from '~services/firebase-client'
import { useCurrentQueueConsumer } from '~services/queue-watcher/current'
import { IncomingSwapRequestSource } from '~sources/incoming-swap-request-source'

export function useIncomingSwapRequestWatcher(myTicketId: string): void {
  const requestId = useRelinkValue(IncomingSwapRequestSource, s => s?.requestId)
  const currentQueue = useCurrentQueueConsumer(q => q.data)
  const currentArcade = useArcadeInfo()
  // TODO: [High priority] Concerning this, try to send a request so the popup appears on the receiver's end, then take or close another random ticket to trigger change in the queueState and see if the popup flashes
  useEffect(() => {
    if (!myTicketId || currentQueue.length <= 0) { return }
    const unsubscribeListener = onSnapshot(query(
      DBCollection.SwapRequests,
      where(Field.arcadeId, '==', currentArcade.id),
      where(Field.targetTicketId, '==', myTicketId),
      where(Field.swapRequestStatus, '==', SwapRequestStatus.PENDING),
      where(Field.declineCount, '<', MAX_ALLOWED_SWAP_REQUEST_RETRY_COUNT),
      limit(1),
    ), async (querySnapshot) => {
      if (!querySnapshot.empty) {
        const querySnapshotDoc = querySnapshot.docs[0]
        const snapshotData = querySnapshotDoc.data()
        const sourceTicket = currentQueue.find(ticket => {
          return ticket.id === snapshotData[Field.sourceTicketId]
        })
        const targetTicket = currentQueue.find(ticket => {
          return ticket.id === snapshotData[Field.targetTicketId]
        })
        await IncomingSwapRequestSource.set({
          requestId: querySnapshotDoc.id,
          sourcePlayerBannerUrl: snapshotData[Field.sourcePlayerBannerUrl],
          sourcePlayerName: snapshotData[Field.sourcePlayerName],
          sourceNumber: sourceTicket?.ticketNumber || -1,
          targetNumber: targetTicket?.ticketNumber || -1,
        })
        // TODO: [Low priority] Show notification via service worker when receive swap requests
      }
    })
    return () => { unsubscribeListener() }
  }, [myTicketId, currentQueue, currentArcade.id])
  useEffect(() => {
    if (!requestId) { return }
    const unsubscribeListener = onSnapshot(
      doc(DBCollection.SwapRequests, requestId),
      async (docSnapshot) => {
        const docData = docSnapshot.data()
        if (docData[Field.swapRequestStatus] === SwapRequestStatus.CANCELLED) {
          // TODO: [Low priority] Navigator remove notification
          await IncomingSwapRequestSource.reset()
          await CustomDialog.alert(`${docData[Field.sourcePlayerName]} cancelled the swap request.`)
        }
      }
    )
    return () => { unsubscribeListener() }
  }, [requestId])
}
