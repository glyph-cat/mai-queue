import { MaterialIcon, MaterialIconName, delay, useRef } from '@glyph-cat/swiss-army-knife'
import { useCallback, useState } from 'react'
import { useRelinkValue } from 'react-relink'
import { IncidentReportType } from '~abstractions'
import { BaseDialog, CustomDialogButtonContainer } from '~components/custom-dialog/components'
import { Divider } from '~components/divider'
import { LinkButton, TextButton } from '~components/form'
import { LoadingCover } from '~components/loading-cover'
import { ANIMATED_BACKDROP_TRANSITION_DURATION, DateTimeFormat, Field } from '~constants'
import { APISubmitIncidentReport } from '~services/api/incident-report/submit'
import {
  DEFAULT_INCIDENT_REPORT_TYPE_DETAIL_DATA,
  IncidentReportSource,
  useArcadeInfo,
} from '~services/arcade-info'
import { useTheme } from '~services/theme'
import { ConfigSource } from '~sources/config'
import { handleClientError } from '~unstable/show-error-alert'
import { formatArcadeName } from '~utils/format-arcade-name'
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
  // {
  //   label: 'Something else',
  //   icon: 'more_horiz',
  //   value: IncidentReportType.OTHER,
  // },
]

export interface ArcadeInfoPopupProps {
  onDismiss(): void
}

export function ArcadeInfoPopup({
  onDismiss,
}: ArcadeInfoPopupProps): JSX.Element {
  const currentArcade = useArcadeInfo()

  const baseDialogRef = useRef<BaseDialog>()
  const handleOnDismiss = useCallback(async () => {
    await baseDialogRef.current.hide()
    await delay(ANIMATED_BACKDROP_TRANSITION_DURATION)
    onDismiss()
  }, [onDismiss])

  const deviceKey = useRelinkValue(ConfigSource, (s) => s.deviceKey)

  const [selectedReportType, setSelectedReportType] = useState<IncidentReportType>(null)
  const onSetIncidentType = useCallback((value: IncidentReportType) => {
    setSelectedReportType((v) => v === value ? null : value)
  }, [])
  const [isSubmittingReport, setSubmittingReportStatus] = useState(false)
  const onSubmitIncidentReport = useCallback(async () => {
    if (!selectedReportType) { return } // Early exit
    setSubmittingReportStatus(true)
    try {
      await APISubmitIncidentReport({
        [Field.arcadeId]: currentArcade.id,
        [Field.incidentReportType]: selectedReportType,
      })
    } catch (e) {
      handleClientError(e)
    } finally {
      setSubmittingReportStatus(false)
    }
  }, [currentArcade.id, selectedReportType])

  const { hasOngoingIncidents, data: reportData } = useRelinkValue(IncidentReportSource)
  // NOTE: `selectedReportType` defaults to `null`
  const selectedReportData = reportData[selectedReportType] || DEFAULT_INCIDENT_REPORT_TYPE_DETAIL_DATA
  const incidentAlreadyReportedBySelf = selectedReportData.deviceKeys.includes(deviceKey)

  const [shouldShowReportOptions, setReportOptionsVisibility] = useState(hasOngoingIncidents)
  const showReportOptions = useCallback(() => {
    setReportOptionsVisibility(true)
  }, [])

  const reportButtonStack = []
  if (incidentAlreadyReportedBySelf) {
    reportButtonStack.push(
      <TextButton
        key='cancel'
        label={'Undo report'}
        type='primary'
        onPress={() => { }}
        disabled={!selectedReportType}
      />
    )
  } else {
    reportButtonStack.push(
      <TextButton
        key='report'
        label={'Report incident'}
        type='destructive'
        onPress={onSubmitIncidentReport}
        disabled={!selectedReportType}
      />
    )
  }
  if (selectedReportData.reportCount > 0) {
    reportButtonStack.push(
      <TextButton
        key='inform-resolved'
        label={'Inform resolved'}
        type='safe'
        onPress={() => { }}
        disabled={!selectedReportType}
      />
    )
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

        {shouldShowReportOptions && (
          <>
            <span>{hasOngoingIncidents ? 'Incident reports:' : 'Report an incident:'}</span>
            <div className={styles.incidentButtonStackContainer}>
              {incidentButtonStack}
            </div>
            <CustomDialogButtonContainer>
              {reportButtonStack}
            </CustomDialogButtonContainer>
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
      <LoadingCover visible={isSubmittingReport} />
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
  } = useRelinkValue(IncidentReportSource, (s) => s.data[reportType])
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
