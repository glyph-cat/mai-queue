import { EMPTY_FUNCTION, useRef } from '@glyph-cat/swiss-army-knife'
import { useCallback, useState } from 'react'
import { useRelinkValue } from 'react-relink'
import { SwapRequestStatus } from '~abstractions'
import { BaseDialog, CustomDialogButtonContainer } from '~components/custom-dialog/components'
import { TextButton } from '~components/form'
import { TicketSwapVisualizer } from '~components/ticket-swap-visualizer'
import { Field } from '~constants'
import { useSelfTicket } from '~hooks/self-ticket'
import { APIRespondSwapTicket } from '~services/api/ticket/respond-swap'
import { useTheme } from '~services/theme'
import {
  IIncomingSwapRequestSource,
  IncomingSwapRequestSource,
} from '~sources/incoming-swap-request-source'
import { handleClientError } from '~unstable/show-error-alert'
import { useIncomingSwapRequestWatcher } from './hooks/use-incoming-swap-request-watcher'

export function IncomingSwapNumberRequestPopup(): JSX.Element {
  const incomingSwapRequestState = useRelinkValue(IncomingSwapRequestSource)
  const selfTicket = useSelfTicket()
  useIncomingSwapRequestWatcher(selfTicket?.id)
  if (selfTicket && incomingSwapRequestState) {
    return (
      <IncomingSwapNumberRequestPopupBase
        {...incomingSwapRequestState}
      />
    )
  } else {
    return null
  }
}

function IncomingSwapNumberRequestPopupBase({
  requestId,
  sourcePlayerBannerUrl,
  sourcePlayerName,
  sourceNumber,
  targetNumber,
}: IIncomingSwapRequestSource): JSX.Element {

  const { palette } = useTheme()

  const baseDialogRef = useRef<BaseDialog>()
  const dismissPopup = useCallback(async () => {
    await baseDialogRef.current.hide()
    await IncomingSwapRequestSource.reset()
  }, [])

  const [isAcceptingRequest, setAcceptingRequestStatus] = useState(false)
  const onAccept = useCallback(async () => {
    setAcceptingRequestStatus(true)
    try {
      await APIRespondSwapTicket({
        [Field.swapRequestId]: requestId,
        [Field.swapRequestStatus]: SwapRequestStatus.ACCEPTED,
      })
      await dismissPopup()
    } catch (e) {
      handleClientError(e)
    } finally {
      setAcceptingRequestStatus(false)
    }
  }, [dismissPopup, requestId])

  const [isDecliningRequest, setDecliningRequestStatus] = useState(false)
  const onDecline = useCallback(async () => {
    setDecliningRequestStatus(true)
    try {
      await APIRespondSwapTicket({
        [Field.swapRequestId]: requestId,
        [Field.swapRequestStatus]: SwapRequestStatus.DECLINED,
      })
      await dismissPopup()
    } catch (e) {
      handleClientError(e)
    } finally {
      setDecliningRequestStatus(false)
    }
  }, [dismissPopup, requestId])

  return (
    <BaseDialog
      ref={baseDialogRef}
      title={'Incoming swap request'}
      description={null}
      onDismiss={EMPTY_FUNCTION}
    >
      <TicketSwapVisualizer
        selfNumber={targetNumber}
        engagedNumber={sourceNumber}
        engagedPlayerName={sourcePlayerName}
        engagedPlayerBannerUrl={sourcePlayerBannerUrl}
      />
      <CustomDialogButtonContainer>
        <TextButton
          label='Decline'
          onPress={onDecline}
          color={palette.neutralFill}
          loading={isDecliningRequest}
        />
        <TextButton
          label='Swap'
          onPress={onAccept}
          color={palette.primaryOrange}
          loading={isAcceptingRequest}
        />
      </CustomDialogButtonContainer>
    </BaseDialog>
  )
}
