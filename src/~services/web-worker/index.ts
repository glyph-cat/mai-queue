import { isNumber, useRef } from '@glyph-cat/swiss-army-knife'
import { useCallback, useEffect } from 'react'
import { useRelinkValue } from 'react-relink'
import { useEstimatedWaitingTime } from '~hooks/estimated-waiting-time'
import { useSelfTicket } from '~hooks/self-ticket'
import { useArcadeInfo } from '~services/arcade-info'
import { CLIENT_ROUTE } from '~services/navigation'
import { NotificationSource, checkNotificationPermission } from '~services/notification'
import { UserPreferencesSource } from '~sources/user-preferences'
import {
  CustomWebWorkerBaseEventType,
  CustomWebWorkerNotificationEventData,
} from './abstractions'

const NEXT_TURN_THRESHOLD_MINUTES = 5
const NEXT_TURN_THRESHOLD_SECONDS = NEXT_TURN_THRESHOLD_MINUTES * 1000

export function useWebWorker(): void {
  const workerRef = useRef<Worker>()
  useEffect(() => {
    // Reference: https://github.com/vercel/next.js/tree/canary/examples/with-web-worker
    workerRef.current = new Worker(new URL('./worker', import.meta.url))
    return () => { workerRef.current?.terminate() }
  }, [])

  const notificationState = useRelinkValue(NotificationSource)

  const selfTicket = useSelfTicket()
  const selfTicketId = selfTicket?.id
  const selfTicketCTime = selfTicket?.cTime
  const currentArcade = useArcadeInfo()
  const allowNotifications = useRelinkValue(UserPreferencesSource, s => s.allowNotifications)

  const shouldCreateNotification = useCallback(() => {
    if (allowNotifications) {
      if (!document.hasFocus() && document.visibilityState === 'hidden') {
        if (currentArcade) {
          return true
        }
      }
    }
  }, [allowNotifications, currentArcade])

  const createNotification = useCallback(async (
    messageData: CustomWebWorkerNotificationEventData
  ) => {
    const { key, ...remainingMessageData } = messageData
    await checkNotificationPermission()
    workerRef.current.postMessage(JSON.stringify(remainingMessageData))
    await NotificationSource.set(s => ({ ...s, cache: { ...s.cache, [key]: true } }))
  }, [])

  const estimatedWaitingTime = useEstimatedWaitingTime(selfTicket?.positionInQueue)
  useEffect(() => {
    if (!shouldCreateNotification()) { return } // Early exi
    if (isNumber(estimatedWaitingTime) && estimatedWaitingTime <= NEXT_TURN_THRESHOLD_MINUTES) {
      // No need to show notification if ticket was just created
      if (selfTicketCTime.diffNow().negate().as('seconds') <= NEXT_TURN_THRESHOLD_SECONDS) {
        return // Early exit
      }
      // Only show notification once (no repeat if already shown notification after refresh page)
      const notificationKey = `NEXT_${selfTicketId}`
      if (notificationState.cache[notificationKey]) { return }
      createNotification({
        key: notificationKey,
        type: CustomWebWorkerBaseEventType.NOTIFICATION,
        title: 'It\'s almost your turn next',
        message: `Estimated time: ${estimatedWaitingTime}minute(s)`,
        url: CLIENT_ROUTE.root,
      })
    }
  }, [createNotification, shouldCreateNotification, estimatedWaitingTime, notificationState.cache, selfTicketId, selfTicketCTime])

  // useEffect(() => {
  //   if (!shouldCreateNotification()) { return } // Early exit
  //   // TODO: [Low priority] Show notification for swap requests
  //   const TEMP_playerName = '<player>' // TODO: [Low priority]
  //   createNotification({
  //     type: CustomWebWorkerBaseEventType.NOTIFICATION,
  //     title: `Swap request from ${TEMP_playerName}`,
  //     message: '', // TODO: [Low priority]
  //     url: CLIENT_ROUTE.root,
  //   })
  // }, [createNotification, shouldCreateNotification])

}
