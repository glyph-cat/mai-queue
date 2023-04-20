import {
  concatClassNames,
  delay,
  getRandomNumber,
  isNumber,
  useLayoutEffect,
  useRef,
} from '@glyph-cat/swiss-army-knife'
import { QRCodeSVG } from 'qrcode.react'
import { ChangeEvent, useCallback, useEffect, useState } from 'react'
import { useRelinkValue } from 'react-relink'
import { CloseTicketReason } from '~abstractions'
import { AnimatedBackdrop } from '~components/animated-backdrop'
import { CustomDialog } from '~components/custom-dialog'
import { ChoiceItem } from '~components/custom-dialog/choice'
import { LinkButton, TextButton, ToggleSwitch, ToggleSwitchWithLabel } from '~components/form'
import { LiveVideoCanvas } from '~components/live-video-canvas'
import { LoadingCover } from '~components/loading-cover'
import { Spinner } from '~components/spinner'
import {
  ENV,
  Field,
  GlobalStyles,
  OPEN_IN_NEW_TAB_PROPS,
} from '~constants'
import { InvalidDeviceKeyError, InvalidFriendCodeError } from '~errors'
import { useEstimatedWaitingTime } from '~hooks/estimated-waiting-time'
import { useResizeSensor } from '~hooks/resize-sensor'
import { useCustomBrowserMultiFormatReader } from '~hooks/scanner'
import { useSelfTicket } from '~hooks/self-ticket'
import { APIRequestDeviceKey } from '~services/api/device/request-key'
import { APISetFriendCodeAlt } from '~services/api/device/set-friend-code-alt'
import { APICloseTicket } from '~services/api/ticket/close'
import { APIGetNewTicket } from '~services/api/ticket/get-new'
import { APITransferTicket } from '~services/api/ticket/transfer'
import { useArcadeInfo } from '~services/arcade-info'
import { useGeolocationPosition } from '~services/geolocation'
import { useCurrentQueueConsumer } from '~services/queue-watcher/current'
import { useTheme } from '~services/theme'
import { ConfigSource } from '~sources/config'
import { UnstableSource } from '~sources/unstable'
import { clearCache } from '~unstable/clear-cache'
import { handleClientError } from '~unstable/show-error-alert'
import { checkIfCoordIsWithinRadius } from '~utils/coords-intersection'
import { QR_EXPIRY_DURATION, decryptDeviceKeyQR, useDeviceKeyQRValue } from '~utils/qr'
import { PaginationDotIndicator } from './components/pagination-dot-indicator'
import { StepButton } from './components/step-button'
import styles from './index.module.css'
import {
  MAX_VISIBLE_STEP_INDEX,
  StepIndex,
  StepWizard,
  StepWizardSource,
} from './source'
import Link from 'next/link'
import { CLIENT_ROUTE } from '~services/navigation'
import { UserPreferencesSource } from '~sources/user-preferences'

// TODO: [High priority] Reflect to show status cannot take number if not near arcade, how to visually convey this?

export interface BottomSheetProps {
  onScrollToTicketInList(ticketId: string): void
}

export function BottomSheet({
  onScrollToTicketInList,
}: BottomSheetProps): JSX.Element {

  // #region UI
  const { palette } = useTheme()
  const childContainerRef = useRef<HTMLDivElement>()
  const childContainerSize = useResizeSensor(childContainerRef.current)
  const {
    step,
    shouldMountAnimatedBackdrop,
    shouldShowBottomSheet,
  } = useRelinkValue(StepWizardSource)
  // #endregion UI

  // #region Hooks & derivative data
  const currentQueueLastFetchedTime = useCurrentQueueConsumer((s) => s.lastFetched)
  const isFetchingQueue = Object.is(currentQueueLastFetchedTime, null)
  const { deviceKey, friendCode } = useRelinkValue(ConfigSource)
  const currentArcade = useArcadeInfo()
  const geolocationPosition = useGeolocationPosition()
  const coordIsWithinRadius = checkIfCoordIsWithinRadius(
    geolocationPosition.coords,
    currentArcade.coordinates,
    300
  )
  // #endregion Hooks & derivative data

  // #region Ticket status
  const selfTicket = useSelfTicket()
  const selfTicketId = selfTicket?.id
  const selfTicketNumber = selfTicket?.ticketNumber
  const estimatedWaitingTime = useEstimatedWaitingTime(selfTicket?.positionInQueue)
  const isProbablyMyTurnNext = isNumber(estimatedWaitingTime) && estimatedWaitingTime <= 0
  let waitingTimeString: string
  if (estimatedWaitingTime >= 60) {
    const roundedHours = Math.ceil(estimatedWaitingTime * 10 / 60) / 10
    waitingTimeString = `${roundedHours} hour${roundedHours === 1 ? '' : 's'}`
  } else if (estimatedWaitingTime >= 0) {
    waitingTimeString = `${estimatedWaitingTime} minute${estimatedWaitingTime === 1 ? '' : 's'}`
  } else {
    waitingTimeString = '? minutes'
  }
  const displayWaitStatus = shouldShowBottomSheet
    ? isProbablyMyTurnNext
      ? 'It\'s your turn next!'
      : `Estimated waiting time: ${waitingTimeString}`
    : isProbablyMyTurnNext
      ? 'Up next!'
      : `~${waitingTimeString}`
  // #endregion Ticket status

  // #region Actions
  // TODO: [High priority] Mimic TextButton to show loading state when taking ticket
  const [isRequestingForNumber, setNumberRequestState] = useState(false)
  const onRequestNewTicket = useCallback(async () => {
    if (ENV.VERCEL_ENV === 'production') {
      if (!coordIsWithinRadius) {
        await CustomDialog.alert('You must be at the arcade to take a number')
        return // Early exit
      }
    }
    let isRequestSuccessful = false
    try {
      setNumberRequestState(true)
      let $deviceKey = deviceKey
      if (!$deviceKey) {
        $deviceKey = await APIRequestDeviceKey()
        await ConfigSource.set((s) => ({ ...s, deviceKey: $deviceKey }))
      }
      const ticketId = await APIGetNewTicket({
        [Field.arcadeId]: currentArcade.id,
        [Field.friendCode]: friendCode,
      })
      onScrollToTicketInList(ticketId)
      isRequestSuccessful = true
      if (!friendCode) {
        await StepWizardSource.set((s) => ({ ...s, step: StepIndex.SET_FRIEND_CODE }))
      } else if (!isProbablyMyTurnNext) {
        await StepWizardSource.set((s) => ({ ...s, step: StepWizardSource.default.step }))
      }
    } catch (e) {
      const errorCode = e.response?.data?.code
      if (errorCode === InvalidDeviceKeyError.code) {
        handleClientError(e, 'Device key has changed, please try again.')
        await ConfigSource.set((s) => ({
          ...s,
          deviceKey: ConfigSource.default.deviceKey,
        }))
      } else if (errorCode === InvalidFriendCodeError.code) {
        handleClientError(e)
        await StepWizardSource.set((s) => ({ ...s, step: StepIndex.SET_FRIEND_CODE }))
        await ConfigSource.set((s) => ({
          ...s,
          friendCode: ConfigSource.default.friendCode,
        }))
      } else {
        handleClientError(e)
      }
    } finally {
      setNumberRequestState(false)
    }
    if (isRequestSuccessful && friendCode) {
      try {
        await UnstableSource.set((s) => ({ ...s, isRetrievingPlayerInfo: true }))
        await delay(getRandomNumber(5000, 10000)) // See footnote [A]
        await APISetFriendCodeAlt({ f: friendCode })
      } catch (e) {
        handleClientError(e)
      } finally {
        await UnstableSource.set((s) => ({ ...s, isRetrievingPlayerInfo: false }))
      }
    }
  }, [coordIsWithinRadius, currentArcade.id, deviceKey, friendCode, isProbablyMyTurnNext, onScrollToTicketInList])

  // TODO: [High priority] Mimic TextButton to show loading state when closing ticket
  const [isClosingTicket, setTicketClosingState] = useState(false)
  const onRequestCloseTicket = useCallback(async () => {
    const responseData: Array<ChoiceItem<CloseTicketReason>> = []
    if (isProbablyMyTurnNext) {
      responseData.push({
        label: 'Close ticket',
        value: CloseTicketReason.CLOSE,
        type: 'safe',
      })
    }
    responseData.push({
      label: isProbablyMyTurnNext ? 'Last minute withdraw' : 'Withdraw ticket',
      value: CloseTicketReason.WITHDRAW,
      type: 'destructive',
    })
    responseData.push({
      label: 'Cancel',
    })
    const response = await CustomDialog.choice<CloseTicketReason>(
      `Confirm ${isProbablyMyTurnNext ? 'close' : 'withdraw'} ticket?`,
      null,
      { data: responseData }
    )
    if (isNumber(response)) {
      try {
        setTicketClosingState(true)
        await APICloseTicket({
          [Field.ticketId]: selfTicketId,
          [Field.xReason]: response,
        })
        StepWizard.hideBottomSheet()
        CustomDialog.alert(`Ticket ${response === CloseTicketReason.CLOSE ? 'closed' : 'withdrawn'} successfully`)
      } catch (e) {
        handleClientError(e)
      } finally {
        setTicketClosingState(false)
      }
    }
  }, [isProbablyMyTurnNext, selfTicketId])

  // #endregion Actions

  return (
    <>
      {shouldMountAnimatedBackdrop && (
        <AnimatedBackdrop
          pressEscToDismiss
          tapOutsideToDismiss
          onDismiss={StepWizard.hideBottomSheet}
          visible={shouldShowBottomSheet}
        />
      )}
      <div
        className={concatClassNames(
          styles.container,
          shouldShowBottomSheet
            ? styles.containerAsFloatingSheet
            : styles.containerAsFloatingButton,
        )}
        style={{
          height: childContainerSize.height,
          ...(selfTicket || shouldShowBottomSheet ? {} : {
            backgroundColor: palette.primaryOrange,
          })
        }}
        onClick={shouldShowBottomSheet ? null : StepWizard.showBottomSheet}
      >
        <div
          ref={childContainerRef}
          style={{
            gridTemplateColumns: 'auto 1fr auto',
            ...(shouldShowBottomSheet ? {
              gap: 10,
              padding: 10,
              paddingTop: 20,
            } : {}),
          }}
        >

          <div className={concatClassNames(
            styles.sideArea,
            shouldShowBottomSheet && styles.sideAreaVisible,
          )}>
            <StepButton
              icon='chevron_left'
              onPress={StepWizard.stepBackward}
              disabled={step <= StepIndex.CONFIG}
              hidden={!StepWizard.isSteppable(step)}
            />
          </div>

          {/* Step wizard area */}
          <div style={shouldShowBottomSheet ? {
            gap: 10,
            // backgroundColor: 'yellowgreen',
          } : {}}>

            {step === StepIndex.CONFIG && <GeneralConfigSection />}

            {step === StepIndex.TAKE_TICKET && (
              <>
                <div className={GlobalStyles.centerAll}>
                  {selfTicket
                    ? <div className={concatClassNames(
                      styles.waitStatusArea,
                      shouldShowBottomSheet ? null : styles.buttonBase,
                    )}>
                      <div className={styles.waitStatusAreaContainer}>
                        <span className={concatClassNames(
                          styles.ticketNumber,
                          shouldShowBottomSheet ? styles.ticketNumberLarge : null
                        )}>
                          {selfTicketNumber}
                        </span>
                        <span className={concatClassNames(
                          styles.displayWaitStatus,
                          isProbablyMyTurnNext ? GlobalStyles.fadedBlink : null,
                        )}>
                          {displayWaitStatus}
                        </span>
                      </div>
                    </div>
                    : isFetchingQueue
                      ? <div
                        className={concatClassNames(
                          styles.buttonBase,
                          styles.button,
                        )}
                      >
                        <Spinner
                          fgColor={palette.fixedWhite}
                          bgColor={`${palette.fixedWhite}60`}
                        />
                      </div>
                      : <div
                        className={concatClassNames(
                          styles.buttonBase,
                          styles.button,
                          shouldShowBottomSheet && styles.buttonCompact,
                        )}
                        onClick={shouldShowBottomSheet ? onRequestNewTicket : null}
                      >
                        {'Take number'}
                      </div>
                  }
                  {shouldShowBottomSheet && selfTicket && (
                    <div
                      className={concatClassNames(
                        styles.buttonBase,
                        styles.button,
                        styles.buttonCompact,
                      )}
                      style={{
                        marginTop: 5,
                        backgroundColor: isProbablyMyTurnNext
                          ? palette.safeGreen
                          : palette.dangerRed,
                      }}
                      onClick={shouldShowBottomSheet ? onRequestCloseTicket : null}
                    >
                      {`${isProbablyMyTurnNext ? 'Close' : 'Withdraw'} ticket`}
                    </div>
                  )}
                </div>

                {shouldShowBottomSheet && (
                  <>
                    <span style={{ textAlign: 'center' }}>~ or ~</span>
                    <div className={GlobalStyles.centerAll}>
                      <LinkButton
                        {...(selfTicket ? {
                          label: 'Scan QR',
                          onPress: StepWizard.showCamera,
                        } : {
                          label: 'Show QR',
                          onPress: StepWizard.showQR,
                        })}
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {step === StepIndex.SHOW_QR && <ShowQRSection onScrollToTicketInList={onScrollToTicketInList} />}
            {step === StepIndex.SHOW_CAMERA && <ScanQRSection />}
            {step === StepIndex.SET_FRIEND_CODE && <SetFriendCodeSection />}

            {shouldShowBottomSheet && (
              <div className={GlobalStyles.centerAll}>
                <PaginationDotIndicator value={step} />
              </div>
            )}

          </div>
          <div className={concatClassNames(
            styles.sideArea,
            shouldShowBottomSheet && styles.sideAreaVisible,
          )}>
            <StepButton
              icon='chevron_right'
              onPress={StepWizard.stepForward}
              disabled={step >= MAX_VISIBLE_STEP_INDEX}
              hidden={!StepWizard.isSteppable(step)}
            />
          </div>
        </div>
      </div>
      <LoadingCover visible={isRequestingForNumber || isClosingTicket} />
    </>
  )
}

function GeneralConfigSection(): JSX.Element {
  const { palette } = useTheme()
  const selfTicket = useSelfTicket()
  const selfTicketId = selfTicket?.id
  const selfTicketNumber = selfTicket?.ticketNumber

  const allowNotifications = useRelinkValue(UserPreferencesSource, (s) => s.allowNotifications)
  const onChangeAllowNotifications = useCallback(async (newAllowNotificationsState: boolean) => {
    await UserPreferencesSource.set((s) => ({
      ...s,
      allowNotifications: newAllowNotificationsState,
    }))
  }, [])

  const onRequestClearCache = useCallback(async () => {
    const shouldProceed = await CustomDialog.confirm(
      'Confirm clear cache?',
      selfTicketId ? <span style={{ color: palette.dangerRed }}>
        {`Your active ticket #${selfTicketNumber} will also be closed.`}
      </span> : null,
      { destructive: true }
    )
    if (!shouldProceed) { return }
    await clearCache({ ticketId: selfTicketId })
  }, [palette.dangerRed, selfTicketId, selfTicketNumber])

  return (
    <div style={{}}>
      <div style={{ gap: 20 }}>
        <span className={styles.stepTitle}>Settings</span>
        <div className={styles.notificationsField}>
          <ToggleSwitchWithLabel
            label={'Notifications'}
            value={allowNotifications}
            onChange={onChangeAllowNotifications}
          />
        </div>
        <div style={{ backgroundColor: '#80808040', height: 1 }} />
        <TextButton
          label={'Clear cache'}
          onPress={onRequestClearCache}
          color={palette.dangerRed}
          style={{ minWidth: 200, justifySelf: 'center' }}
        />
      </div>
    </div>
  )
}


function SetFriendCodeSection(): JSX.Element {
  const selfTicket = useSelfTicket()
  // TODO: [Mid priority] this should be based on current queue if player has ticket in the queue
  const firstFriendCodeSnapshot = useRef(() => ConfigSource.get().friendCode)
  const [friendCode, setFriendCode] = useState(firstFriendCodeSnapshot.current)
  const configState = useRelinkValue(ConfigSource)
  const handleOnChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFriendCode(e.target.value)
  }, [])

  const [isSavingFriendCode, setSavingFriendCodeStatus] = useState(false)

  const saveFriendCode = useCallback(async () => {
    if (!friendCode) {
      const shouldProceed = await (selfTicket
        ? CustomDialog.confirm('Are you sure you want to unlink the friend code from your ticket?')
        : CustomDialog.confirm('Confirm remove friend code?', 'This friend code will not be used the next time you take a ticket.'))
      if (!shouldProceed) { return }
    }
    try {
      setSavingFriendCodeStatus(true)
      if (selfTicket) {
        await delay(getRandomNumber(3000, 7000)) // See footnote [A]
        await APISetFriendCodeAlt({ f: friendCode })
        await StepWizard.hideBottomSheet()
      }
      await delay(getRandomNumber(500, 1000))
      await ConfigSource.set((s) => ({ ...s, friendCode }))
    } catch (e) {
      handleClientError(e)
    } finally {
      setSavingFriendCodeStatus(false)
    }
  }, [friendCode, selfTicket])

  return (
    <>
      <div className={GlobalStyles.centerAll} style={{ gap: 10, marginBottom: 10 }}>
        <span style={{ textAlign: 'center' }}>
          {'Enter friend code to show your profile on your ticket.'}
        </span>
        <Link href={CLIENT_ROUTE.help_friendCode} {...OPEN_IN_NEW_TAB_PROPS}>How to find my friend code?</Link>
      </div>
      <input
        className={styles.friendCodeInput}
        value={friendCode}
        onChange={handleOnChange}
        placeholder={'Enter friend code (optional)'}
        inputMode='numeric'
      />
      {friendCode || friendCode !== firstFriendCodeSnapshot.current
        ? <TextButton
          label={configState.friendCode === friendCode ? 'Saved' : 'Save'}
          type='primary'
          onPress={saveFriendCode}
          disabled={configState.friendCode === friendCode}
          loading={isSavingFriendCode}
        />
        : <TextButton
          label={'Skip'}
          onPress={StepWizard.hideBottomSheet}
        />
      }
      <LoadingCover visible={isSavingFriendCode} />
    </>
  )
}

interface ShowQRSectionProps {
  onScrollToTicketInList(ticketId: string): void
}

function ShowQRSection({
  onScrollToTicketInList,
}: ShowQRSectionProps): JSX.Element {
  const { palette } = useTheme()
  const deviceKey = useRelinkValue(ConfigSource, (s) => s.deviceKey)
  const [qrValue, timeLeft] = useDeviceKeyQRValue(deviceKey)
  const selfTicket = useCurrentQueueConsumer((s) => s.data.find((item) => item.deviceKey === deviceKey))
  useEffect(() => {
    if (selfTicket) {
      StepWizard.hideBottomSheet()
      onScrollToTicketInList(selfTicket.id)
    }
  }, [onScrollToTicketInList, selfTicket])
  const QR_SIZE = 200 // px
  return (
    <div className={styles.showQRSectionContainer}>
      <div
        className={styles.qrContainer}
        style={{ height: QR_SIZE, width: QR_SIZE }}
      >
        {qrValue
          ? <QRCodeSVG
            value={qrValue}
            bgColor={palette.fixedWhite}
            fgColor={palette.fixedBlack}
            size={QR_SIZE}
            level='L'
          />
          : <Spinner />
        }
      </div>
      <span style={{ opacity: qrValue ? 1 : 0, textAlign: 'center' }}>
        {'QR code will refresh in '}
        <br />
        {`${timeLeft} second${timeLeft === 1 ? '' : 's'}.`}
      </span>
      <span
        className={GlobalStyles.anchor}
        style={{ textAlign: 'center' }}
        onClick={StepWizard.returnToTicketSection}
      >
        {'Cancel'}
      </span>
    </div>
  )
}

enum ScanQRMode {
  TAKE_FOR = 1,
  TRANSFER,
}

const STRING_LONG_TAKE_TICKET_FOR_ANOTHER_PLAYER = 'Take ticket for another player'
const STRING_LONG_TRANSFER_TICKET_TO_ANOTHER_PLAYER = 'Transfer ticket to another player'
const STRING_SHORT_TAKE_TICKET_FOR_ANOTHER_PLAYER = 'Take for another player'
const STRING_SHORT_TRANSFER_TICKET_TO_ANOTHER_PLAYER = 'Transfer to another player'

function ScanQRSection(): JSX.Element {
  const [mode, setMode] = useState(ScanQRMode.TAKE_FOR)
  const setModeToTake = useCallback(() => { setMode(ScanQRMode.TAKE_FOR) }, [])
  const setModeToTransfer = useCallback(() => { setMode(ScanQRMode.TRANSFER) }, [])

  const currentArcade = useArcadeInfo()
  const customBrowserMultiFormatReader = useCustomBrowserMultiFormatReader()
  const readerState = useRelinkValue(customBrowserMultiFormatReader.state)

  const [isNetworkBusy, setNetworkBusyStatus] = useState(false)
  const processQR = useCallback(async () => {
    if (!readerState.result) { return } // Early exit
    const decryptedData = decryptDeviceKeyQR(readerState.result)
    if (!decryptedData) { return } // Early exit
    try {
      const {
        [Field.cTime]: cTime,
        [Field.deviceKey]: deviceKey,
      } = decryptedData
      const diff = cTime.diffNow().negate().as('milliseconds')
      if (diff > (QR_EXPIRY_DURATION * 1000)) {
        CustomDialog.alert('QR has expired')
        return // Early exit
      }
      setNetworkBusyStatus(true)
      if (mode === ScanQRMode.TAKE_FOR) {
        await APIGetNewTicket({
          [Field.arcadeId]: currentArcade.id,
          [Field.deviceKey]: deviceKey,
        })
        CustomDialog.alert('New ticket created successfully')
      } else if (mode === ScanQRMode.TRANSFER) {
        await APITransferTicket({
          [Field.arcadeId]: currentArcade.id,
          [Field.deviceKey]: deviceKey,
        })
        CustomDialog.alert('Ticket transferred successfully')
      }
      await StepWizard.hideBottomSheet()
    } catch (e) {
      handleClientError(e)
      setNetworkBusyStatus(false)
    }
  }, [currentArcade.id, mode, readerState.result])

  useLayoutEffect(() => {
    if (readerState.loading || isNetworkBusy) { return } // Early exit
    customBrowserMultiFormatReader.start()
    return () => { customBrowserMultiFormatReader.reset() }
  }, [customBrowserMultiFormatReader, isNetworkBusy, readerState.loading])
  useLayoutEffect(() => { processQR() }, [processQR])

  return (
    <div style={{ gap: 10, placeItems: 'center' }}>
      <div style={{ gap: 5, placeItems: 'center' }}>
        <span className={styles.scanQRTitle}>
          {mode === ScanQRMode.TAKE_FOR
            ? STRING_LONG_TAKE_TICKET_FOR_ANOTHER_PLAYER
            : STRING_LONG_TRANSFER_TICKET_TO_ANOTHER_PLAYER
          }
        </span>
        <span>{'or'}</span>
        <span
          className={GlobalStyles.anchor}
          onClick={mode !== ScanQRMode.TAKE_FOR ? setModeToTake : setModeToTransfer}
        >
          {mode !== ScanQRMode.TAKE_FOR
            ? STRING_SHORT_TAKE_TICKET_FOR_ANOTHER_PLAYER
            : STRING_SHORT_TRANSFER_TICKET_TO_ANOTHER_PLAYER
          }
        </span>
      </div>
      <LiveVideoCanvas
        loading={isNetworkBusy}
        videoRef={customBrowserMultiFormatReader.videoRef}
        loadingHint={isNetworkBusy ? 'Processing...' : null}
      />
      <span
        className={GlobalStyles.anchor}
        style={{ textAlign: 'center' }}
        onClick={StepWizard.returnToTicketSection}
      >
        {'Cancel'}
      </span>
    </div>
  )
}

// Footnotes
// [A] Random delays are added to reduce chances of race conditions, for fearing
//     that if the same account is logged in twice, one of them will expire.

