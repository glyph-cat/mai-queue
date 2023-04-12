import { isNumber, useRef } from '@glyph-cat/swiss-army-knife'
import { useCallback, useEffect } from 'react'
import { useRelinkValue } from 'react-relink'
import { useEstimatedWaitingTime } from '~hooks/estimated-waiting-time'
import { useSelfTicket } from '~hooks/self-ticket'
import { useArcadeInfo } from '~services/arcade-info'
import { CLIENT_ROUTE } from '~services/navigation'
import { checkNotificationPermission } from '~services/notification'
import { UserPreferencesSource } from '~sources/user-preferences'
import {
  CustomWebWorkerBaseEventType,
  CustomWebWorkerNotificationEventData,
} from './abstractions'

export function useWebWorker(): void {
  const workerRef = useRef<Worker>()
  useEffect(() => {
    // Reference: https://github.com/vercel/next.js/tree/canary/examples/with-web-worker
    workerRef.current = new Worker(new URL('./worker', import.meta.url))
    return () => { workerRef.current?.terminate() }
  }, [])

  const selfTicket = useSelfTicket()
  const currentArcade = useArcadeInfo()
  const allowNotifications = useRelinkValue(UserPreferencesSource, (s) => s.allowNotifications)

  const shouldCreateNotifications = useCallback(() => {
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
    await checkNotificationPermission()
    workerRef.current.postMessage(JSON.stringify(messageData))
  }, [])

  const estimatedWaitingTime = useEstimatedWaitingTime(selfTicket?.positionInQueue)
  useEffect(() => {
    if (!shouldCreateNotifications()) { return } // Early exit
    // Show notification when there's 5 minutes left
    if (isNumber(estimatedWaitingTime) && estimatedWaitingTime <= 5) {
      // TODO: [Low priority] Only show notification once (no repeat if already shown notification after refresh page)
      // TODO: [Low priority] Refactor
      // if (localStorage.getItem(String(selfTicket.originalTicketNumber))) {
      //   return
      // }
      // localStorage.setItem(String(selfTicket.originalTicketNumber), 'true')
      createNotification({
        type: CustomWebWorkerBaseEventType.NOTIFICATION,
        title: 'It\'s your turn next',
        message: `Estimated time: ${estimatedWaitingTime}minute(s)`,
        url: CLIENT_ROUTE.root,
      })
    }
  }, [createNotification, shouldCreateNotifications, estimatedWaitingTime])

  useEffect(() => {
    if (!shouldCreateNotifications()) { return } // Early exit
    // TODO: [Low priority] Show notification for swap requests
    const TEMP_playerName = '<player>' // TODO: [Low priority]
    createNotification({
      type: CustomWebWorkerBaseEventType.NOTIFICATION,
      title: `Swap request from ${TEMP_playerName}`,
      message: '', // TODO: [Low priority]
      url: CLIENT_ROUTE.root,
    })
  }, [createNotification, shouldCreateNotifications])

}
