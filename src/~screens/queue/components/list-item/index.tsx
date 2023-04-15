import { MaterialIcon, concatClassNames } from '@glyph-cat/swiss-army-knife'
import { memo, useCallback, useState } from 'react'
import { useRelinkValue } from 'react-relink'
import { ListChildComponentProps } from 'react-window'
import { CloseTicketReason, IQueueTicket } from '~abstractions'
import { VoteType } from '~abstractions/vote'
import {
  waitForOutgoingSwapRequestSourceToBeNull,
} from '~components/__app-tsx__/outgoing-swap-number-request-popup'
import { CustomDialog } from '~components/custom-dialog'
import {
  CUSTOM_DIALOG_CANCEL_VALUE,
  CustomDialogCancellableValue,
} from '~components/custom-dialog/abstractions'
import { LoadingCover } from '~components/loading-cover'
import { DateTimeFormat, Field, GlobalStyles } from '~constants'
import { useSelfTicket } from '~hooks/self-ticket'
import { APIReportStaleTicket } from '~services/api/ticket/report-stale'
import { onConfirmRequestSwapNumber } from '~sources/outgoing-swap-request-source'
import { UnstableSource } from '~sources/unstable'
import { hasProperty } from '~unstable/has-property'
import { handleClientError } from '~unstable/show-error-alert'
import { ListItemMenu, ListItemMenuProps, ListItemMenuResponse } from '../list-item-menu'
import { PlayerInfoDisplay } from '../player-info-display'
import styles from './index.module.css'
import { useEstimatedWaitingTime } from '~hooks/estimated-waiting-time'


export interface ListItemPropData {
  get(index: number): IQueueTicket
  deviceKey: string
  loading: boolean
}

export type ListItemProps = ListChildComponentProps<ListItemPropData>

export const ListItem = memo(({ data, index, style }: ListItemProps): JSX.Element => {
  const {
    get: getData,
    deviceKey,
    loading,
  } = data
  const ticket = getData(index)
  const {
    id: ticketId,
    ticketNumber,
    bannerUrl,
    playerName,
    cTime,
    firstObservationTime,
    xTime,
    xReason,
    staleFlags,
  } = ticket

  const selfTicket = useSelfTicket()
  const selfTicketId = selfTicket?.id
  const selfTicketNumber = selfTicket?.ticketNumber
  const currentTicketBelongsToSelf = selfTicketId === ticketId
  const canShowPopupMenu = !loading &&
    selfTicketNumber &&
    !currentTicketBelongsToSelf &&
    !xTime
  const alreadyFlaggedBySelfAsStale = hasProperty(staleFlags, deviceKey)
  const staleFlagCount = Object.keys(staleFlags).length
  const hasStaleFlags = staleFlagCount > 0
  const estimatedWaitingTime = useEstimatedWaitingTime(index)

  const handleOnRequestSwapNumber = useCallback(async () => {
    await onConfirmRequestSwapNumber(
      selfTicketId,
      ticketId,
      playerName,
      bannerUrl,
    )
  }, [bannerUrl, playerName, selfTicketId, ticketId])

  const [isReportingAsStale, setStaleReportStatus] = useState(false)
  const showPopupMenu = useCallback(async () => {
    let response: CustomDialogCancellableValue<ListItemMenuResponse> = null
    do {
      response = await CustomDialog.freeform<ListItemMenuProps, ListItemMenuResponse>({
        component: ListItemMenu,
        easyDismiss: true,
        props: {
          playerName,
          alreadyFlaggedAsStale: alreadyFlaggedBySelfAsStale,
          bannerUrl,
          staleFlagCount,
          isProbablyStale: estimatedWaitingTime <= 0,
        },
      })
      if (response === ListItemMenuResponse.REQUEST_SWAP) {
        await handleOnRequestSwapNumber()
        await waitForOutgoingSwapRequestSourceToBeNull()
      } else if (response === ListItemMenuResponse.REPORT_STALE) {
        const shouldProceed = await CustomDialog.confirm(
          'Flag as stale?',
          <><b><i>{`${playerName}'s`}</i></b>{` ticket (#${ticketNumber}) will be flagged as stale.`}</>,
        )
        if (shouldProceed) {
          setStaleReportStatus(true)
          try {
            await APIReportStaleTicket({
              [Field.ticketId]: ticketId,
              [Field.voteType]: VoteType.UPVOTE,
            })
            CustomDialog.alert('Ticket has been flagged as stale')
            response = CUSTOM_DIALOG_CANCEL_VALUE
          } catch (e) {
            handleClientError(e)
          } finally {
            setStaleReportStatus(false)
          }
        }
      }
    } while (!Object.is(response, CUSTOM_DIALOG_CANCEL_VALUE))
  }, [alreadyFlaggedBySelfAsStale, bannerUrl, estimatedWaitingTime, handleOnRequestSwapNumber, playerName, staleFlagCount, ticketId, ticketNumber])

  // Only show entrance animation if ticket was just added, but not everytime
  // the DOM element mounts after unmounting due to list virtualization.
  // Since the animation is 500ms, the threshold given is also 500ms.
  const shouldUseEntranceAnimation = firstObservationTime.diffNow().as('milliseconds') >= -500

  const isRetrievingPlayerInfo = useRelinkValue(
    UnstableSource,
    (s) => s.isRetrievingPlayerInfo,
    currentTicketBelongsToSelf
  )

  return (
    <>
      <div
        className={concatClassNames(
          styles.virtualizedCell,
          shouldUseEntranceAnimation ? styles.virtualizedCellAnimated : null,
        )}
        style={{ ...style, opacity: loading ? 0.5 : 1 }}
      >
        <div
          className={concatClassNames(
            styles.itemContainer,
            GlobalStyles.dxShadow,
            currentTicketBelongsToSelf ? styles.itemContainerSelf : null,
            xTime ? styles.itemContainerClosed : null,
            canShowPopupMenu ? styles.itemContainerOtherPlayer : null,
          )}
          onClick={canShowPopupMenu ? showPopupMenu : null}
        >
          <div className={styles.ticketNumberContainer}>
            {ticketNumber}
          </div>
          <div className={styles.ticketInfoContainer}>
            <div className={styles.ticketUpperContainer}>
              <span className={styles.ctime}>
                {cTime.toFormat(DateTimeFormat.USER_TIME_SHORT)}
                {xReason && <>{` (${xReason === CloseTicketReason.CLOSE
                  ? 'Closed'
                  : xReason === CloseTicketReason.WITHDRAW
                    ? 'Withdrawn'
                    : 'Stale'
                  // eslint-disable-next-line indent
                  }: ${xTime.toFormat(DateTimeFormat.USER_TIME_SHORT)})`}</>}
              </span>
              {hasStaleFlags && (
                <span className={styles.staleFlagContainer}>
                  <MaterialIcon name='flag' size={13} />{staleFlagCount}
                </span>
              )}
            </div>
            <PlayerInfoDisplay
              bannerUrl={bannerUrl}
              playerName={playerName}
              isRetrievingPlayerInfo={isRetrievingPlayerInfo}
            />
            {/* This is just as a padding to make the "GUEST" title look symmetrical */}
            {!bannerUrl && <span className={styles.ctime}><br /></span>}
          </div>
        </div>
      </div>
      <LoadingCover visible={isReportingAsStale} />
    </>
  )
})
