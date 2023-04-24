import { MaterialIcon, MaterialIconName, delay, useRef } from '@glyph-cat/swiss-army-knife'
import { useCallback, useState } from 'react'
import { useRelinkValue } from 'react-relink'
import { IncidentReportStatus, IncidentReportType } from '~abstractions'
import { BaseDialog, CustomDialogButtonContainer } from '~components/custom-dialog/components'
import { Divider } from '~components/divider'
import { LinkButton, TextButton } from '~components/form'
import { LoadingCover } from '~components/loading-cover'
import { ANIMATED_BACKDROP_TRANSITION_DURATION, DateTimeFormat, Field } from '~constants'
import { useGetDeviceKey } from '~hooks/get-device-key'
import { APIRemoveIncidentReport } from '~services/api/incident-report/remove'
import { APISubmitIncidentReport } from '~services/api/incident-report/submit'
import {
  DEFAULT_INCIDENT_REPORT_TYPE_DETAIL_DATA,
  IncidentReportSource,
  useArcadeInfo,
} from '~services/arcade-info'
import { useGeolocationChecking } from '~services/geolocation'
import { useTheme } from '~services/theme'
import { UnstableSource } from '~sources/unstable'
import { formatArcadeName } from '~utils/format-arcade-name'
import { handleClientError } from '~utils/show-error-alert'
import styles from './index.module.css'

type IncidentPreset = {
  icon: MaterialIconName
  label: string
  reportType: IncidentReportType
}

const INCIDENT_STACK: Array<IncidentPreset> = [
  {
    label: 'Cabinet offline',
    icon: 'wifi_off',
    reportType: IncidentReportType.CABINET_OFFLINE,
  },
  {
    label: 'Maintenance in progress',
    icon: 'cleaning_services',
    reportType: IncidentReportType.MAINTENANCE_IN_PROGRESS,
  },
  {
    label: 'Arcade not open',
    icon: 'schedule',
    reportType: IncidentReportType.ARCADE_NOT_OPEN,
  },
  {
    label: 'Power outage',
    icon: 'power_off',
    reportType: IncidentReportType.POWER_OUTAGE,
  },
  {
    label: 'Flood',
    // @ts-ignore - TOFIX: [Mid priority] In '@glyph-cat/swiss-army-knife'
    icon: 'flood',
    reportType: IncidentReportType.FLOOD,
  },
  {
    label: 'Something else',
    icon: 'more_horiz',
    reportType: IncidentReportType.OTHER,
  },
]

export function ArcadeInfoPopup(): JSX.Element {
  const shouldShowArcadeInfoPopup = useRelinkValue(UnstableSource, s => s.shouldShowArcadeInfoPopup)
  return shouldShowArcadeInfoPopup ? <ArcadeInfoPopupBase /> : null
}

function ArcadeInfoPopupBase(): JSX.Element {
  const currentArcade = useArcadeInfo()
  const coordIsWithinRadius = useGeolocationChecking()

  const baseDialogRef = useRef<BaseDialog>()
  const handleOnDismiss = useCallback(async () => {
    await baseDialogRef.current.hide()
    await delay(ANIMATED_BACKDROP_TRANSITION_DURATION)
    await UnstableSource.set(s => ({ ...s, shouldShowArcadeInfoPopup: false }))
  }, [])

  const [getDeviceKey] = useGetDeviceKey()
  // Because device key could be `null` if is first time using the website

  const [selectedReportType, setSelectedReportType] = useState<IncidentReportType>(null)
  const onSetIncidentType = useCallback((value: IncidentReportType) => {
    setSelectedReportType(v => v === value ? null : value)
  }, [])

  const {
    hasOngoingIncidents,
    data: reportData,
    reportsBySelf,
  } = useRelinkValue(IncidentReportSource)
  const selectedReportData = reportData[selectedReportType] || DEFAULT_INCIDENT_REPORT_TYPE_DETAIL_DATA
  const selfReportedAsActiveId = reportsBySelf[IncidentReportStatus.ACTIVE][selectedReportType]
  const selfReportedAsResolvedId = reportsBySelf[IncidentReportStatus.RESOLVED][selectedReportType]

  const [hasUserRequestedForReportOptions, setReportOptionsVisibility] = useState(false)
  const showReportOptions = useCallback(() => { setReportOptionsVisibility(true) }, [])

  const [isBusy, setBusyStatus] = useState(false)

  const factorySubmitIncidentReport = useCallback((reportStatus: IncidentReportStatus) => {
    return async () => {
      if (isBusy || !selectedReportType || !coordIsWithinRadius) { return } // Early exit
      setBusyStatus(true)
      try {
        await getDeviceKey()
        await APISubmitIncidentReport({
          [Field.arcadeId]: currentArcade.id,
          [Field.incidentReportType]: selectedReportType,
          [Field.incidentReportStatus]: reportStatus,
        })
      } catch (e) {
        handleClientError(e)
      } finally {
        setBusyStatus(false)
      }
    }
  }, [coordIsWithinRadius, currentArcade.id, getDeviceKey, isBusy, selectedReportType])

  const factoryUndoIncidentReport = useCallback((reportId: string) => {
    return async () => {
      if (isBusy) { return } // Early exit
      setBusyStatus(true)
      try {
        await getDeviceKey()
        await APIRemoveIncidentReport({ [Field.incidentReportId]: reportId })
      } catch (e) {
        handleClientError(e)
      } finally {
        setBusyStatus(false)
      }
    }
  }, [getDeviceKey, isBusy])

  const reportButtonStack = []
  if (selfReportedAsActiveId) {
    reportButtonStack.push(
      <TextButton
        key='undo-report'
        label={'Undo report'}
        type='primary'
        onPress={factoryUndoIncidentReport(selfReportedAsActiveId)}
        disabled={!selectedReportType}
      />
    )
  } else {
    reportButtonStack.push(
      <TextButton
        key='report'
        label={'Report'}
        type='destructive'
        onPress={factorySubmitIncidentReport(IncidentReportStatus.ACTIVE)}
        disabled={!selectedReportType || !coordIsWithinRadius}
      />
    )
  }
  if (selectedReportData.reportCount > 0) {
    if (selfReportedAsResolvedId) {
      reportButtonStack.push(
        <TextButton
          key='undo-resolved'
          label={'Undo'}
          type='safe'
          onPress={factoryUndoIncidentReport(selfReportedAsResolvedId)}
          disabled={!selectedReportType}
        />
      )
    } else if (!selfReportedAsActiveId) {
      // KIV: (Enhancement) Undo + inform resolved?
      reportButtonStack.push(
        <TextButton
          key='inform-resolved'
          label={'Inform solved'}
          type='safe'
          onPress={selfReportedAsActiveId
            // If self attempts to report resolved on an issue that self has
            // previously reported active, then just remove that report instead.
            ? factoryUndoIncidentReport(selfReportedAsActiveId)
            : factorySubmitIncidentReport(IncidentReportStatus.RESOLVED)
          }
          disabled={!selectedReportType || !coordIsWithinRadius}
        />
      )
    }
  }

  const incidentButtonStack = []
  for (let i = 0; i < INCIDENT_STACK.length; i++) {
    const { icon, label, reportType } = INCIDENT_STACK[i]
    incidentButtonStack.push(
      <IncidentButton
        key={icon}
        icon={icon}
        label={label}
        selected={selectedReportType === reportType}
        onPress={onSetIncidentType}
        reportType={reportType}
      />
    )
  }

  const shouldShowReportOptions = hasUserRequestedForReportOptions || hasOngoingIncidents

  return (
    <>
      <BaseDialog
        ref={baseDialogRef}
        title={'Arcade Info'}
        description={<>{'You queue location is set to:'}<br /><b>{formatArcadeName(currentArcade)}</b>.</>}
        onDismiss={handleOnDismiss}
        easyDismiss
        disableMidPadding
      >
        <Divider />
        {!shouldShowReportOptions && (
          <span>
            {'Something not right at this place? — '}
            <LinkButton
              onPress={showReportOptions}
              label='Make a report'
            />
          </span>
        )}

        {(hasUserRequestedForReportOptions || hasOngoingIncidents) && (
          <>
            <span>{hasOngoingIncidents ? 'Incident reports:' : 'Report an incident:'}</span>
            <div className={styles.incidentButtonStackContainer}>
              {incidentButtonStack}
            </div>
            <CustomDialogButtonContainer>
              {reportButtonStack}
            </CustomDialogButtonContainer>
            {!coordIsWithinRadius && (
              <i style={{ fontSize: '10pt', textAlign: 'center' }}>
                {'Note: You can only submit reports when you\'re at the arcade.'}
              </i>
            )}
          </>
        )}
        <Divider />
        <CustomDialogButtonContainer>
          <TextButton
            label={'Close'}
            onPress={handleOnDismiss}
          />
        </CustomDialogButtonContainer>
      </BaseDialog>
      <LoadingCover visible={isBusy} />
    </>
  )
}

interface IncidentButtonProps {
  icon: MaterialIconName
  label: string
  onPress(reportType: IncidentReportType): void
  selected: boolean
  reportType: IncidentReportType
}

function IncidentButton({
  icon,
  label,
  onPress,
  selected,
  reportType,
}: IncidentButtonProps): JSX.Element {

  const { palette } = useTheme()

  const {
    reportCount,
    timestamp: reportTime,
  } = useRelinkValue(IncidentReportSource, s => s.data[reportType])
  const hasIncident = reportCount > 0

  const handleOnPress = useCallback(() => {
    onPress(reportType)
  }, [onPress, reportType])

  return (
    <div
      className={styles.incidentButtonContainer}
      style={{
        ...(hasIncident ? { color: '#75122b' } : {}),
        ...(selected ? {
          borderColor: palette.fixedRed,
          color: palette.fixedRed,
        } : {}),
      }}
      onClick={handleOnPress}
    >
      <div
        className={styles.incidentButtonUnderlay}
        style={selected ? {
          backgroundColor: palette.lightRed,
        } : (hasIncident ? {
          backgroundColor: palette.lightRed,
        } : {
          backgroundColor: '#d8d8d8',
        })}
      />
      <div className={styles.incidentButtonSubContainer}>
        <MaterialIcon name={icon} />
        <span className={styles.incidentButtonLabel}>{label}</span>
        {reportTime && (
          <span className={styles.time}>
            {reportTime.toFormat(DateTimeFormat.USER_TIME_SHORT)}
          </span>
        )}
        {hasIncident && <div className={styles.badge}>{reportCount}</div>}
      </div>
    </div>
  )
}
