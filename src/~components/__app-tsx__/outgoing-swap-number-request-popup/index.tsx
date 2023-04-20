import { EMPTY_FUNCTION, useRef } from '@glyph-cat/swiss-army-knife'
import { useCallback, useState } from 'react'
import { useRelinkValue } from 'react-relink'
import { CustomDialog } from '~components/custom-dialog'
import { BaseDialog, CustomDialogButtonContainer } from '~components/custom-dialog/components'
import { TextButton } from '~components/form'
import { TicketSwapVisualizer } from '~components/ticket-swap-visualizer'
import { Field, GlobalStyles } from '~constants'
import { useSelfTicket } from '~hooks/self-ticket'
import { APICancelSwapTicket } from '~services/api/ticket/cancel-swap'
import { useCurrentQueueConsumer } from '~services/queue-watcher/current'
import { useTheme } from '~services/theme'
import { onSendRequestSwapNumber } from '~sources/outgoing-swap-request-source'
import { IOutgoingSwapRequestSource } from '~sources/outgoing-swap-request-source/abstractions'
import { OutgoingSwapRequestSource } from '~sources/outgoing-swap-request-source/source'
import { handleClientError } from '~unstable/show-error-alert'
import { useOutgoingSwapRequestWatcher } from './hooks/use-outgoing-swap-request-watcher'
import styles from './index.module.css'

export function OutgoingSwapNumberRequestPopup(): JSX.Element {
  const selfTicket = useSelfTicket()
  const outgoingSwapRequestState = useRelinkValue(OutgoingSwapRequestSource)
  if (selfTicket && outgoingSwapRequestState) {
    return (
      <OutgoingSwapNumberRequestPopupBase
        {...outgoingSwapRequestState}
      />
    )
  } else {
    return null
  }
}

function OutgoingSwapNumberRequestPopupBase({
  requestId,
  targetPlayerName,
  targetPlayerBannerUrl,
  sourceTicketId,
  targetTicketId,
}: IOutgoingSwapRequestSource): JSX.Element {

  const { palette } = useTheme()

  const baseDialogRef = useRef<BaseDialog>()
  const dismissPopup = useCallback(async () => {
    await baseDialogRef.current.hide()
    await OutgoingSwapRequestSource.reset()
  }, [])

  const currentQueueLength = useCurrentQueueConsumer((s) => s.data.length)
  useOutgoingSwapRequestWatcher(
    currentQueueLength,
    requestId,
    useCallback(async () => {
      await dismissPopup()
      await CustomDialog.alert(`${targetPlayerName} has accepted your swap request!`)
    }, [dismissPopup, targetPlayerName]),
    useCallback(async () => {
      await dismissPopup()
      await CustomDialog.alert('Your swap request was declined.')
    }, [dismissPopup])
  )

  const isRequestSent = !!requestId
  const [isSendingRequest, setSendingRequestStatus] = useState(false)
  const handleOnSend = useCallback(async () => {
    if (isSendingRequest) { return }
    setSendingRequestStatus(true)
    try {
      await onSendRequestSwapNumber(
        sourceTicketId,
        targetTicketId,
      )
    } catch (e) {
      handleClientError(e)
    } finally {
      setSendingRequestStatus(false)
    }
  }, [isSendingRequest, sourceTicketId, targetTicketId])

  // NOTE: It is not feasible to cancel a swap request while the API is still
  // being called because the swap request will still be made but to UI reports
  // otherwise, resulting in the player not able to send any more swap requests
  // until the ongoing swap request is removed by a cron task or manually from
  // the Firebase console.

  const [isCancellingRequest, setCancellingRequestStatus] = useState(false)
  const handleOnCancelRequest = useCallback(async () => {
    if (isCancellingRequest) { return }
    setCancellingRequestStatus(true)
    try {
      await APICancelSwapTicket({ [Field.swapRequestId]: requestId })
      await dismissPopup()
      await CustomDialog.alert('Your swap request has been cancelled.')
    } catch (e) {
      handleClientError(e)
    } finally {
      setCancellingRequestStatus(false)
    }
  }, [dismissPopup, isCancellingRequest, requestId])

  const selfTicket = useSelfTicket()
  const targetTicketNumber = useCurrentQueueConsumer((q) => {
    const targetTicket = q.data.find((ticket) => ticket.id === targetTicketId)
    return targetTicket ? targetTicket.ticketNumber : -1
  })

  return (
    <BaseDialog
      ref={baseDialogRef}
      title={isSendingRequest
        ? 'Sending swap request...'
        : 'Send swap request' + (requestId ? '' : '?')
      }
      description={null}
      onDismiss={EMPTY_FUNCTION}
    >
      <div className={styles.container}>
        <TicketSwapVisualizer
          selfNumber={selfTicket.ticketNumber}
          engagedNumber={targetTicketNumber}
          engagedPlayerName={targetPlayerName}
          engagedPlayerBannerUrl={targetPlayerBannerUrl}
        />
        <span className={GlobalStyles.fadedBlink} style={{ textAlign: 'center' }}>
          {requestId ? `Waiting for ${targetPlayerName} to respond...` : <br />}
        </span>
        <CustomDialogButtonContainer>
          <TextButton
            label='Cancel'
            color={palette.neutralFill}
            {...(requestId ? {
              onPress: handleOnCancelRequest,
              loading: isCancellingRequest,
            } : {
              onPress: dismissPopup,
              disabled: isSendingRequest,
            })}
          />
          <TextButton
            label={isRequestSent ? 'Waiting...' : 'Send'}
            onPress={handleOnSend}
            color={palette.primaryOrange}
            loading={isSendingRequest}
            disabled={isRequestSent}
          />
        </CustomDialogButtonContainer>
      </div>
    </BaseDialog>
  )
}

export function waitForOutgoingSwapRequestSourceToBeNull(): Promise<void> {
  if (Object.is(OutgoingSwapRequestSource.get(), null)) {
    return // Early exit
  }
  return new Promise((resolve) => {
    const unwatch = OutgoingSwapRequestSource.watch(({ state }) => {
      if (Object.is(state, null)) {
        unwatch()
        return resolve()
      }
    })
  })
}
