import { Nullable, forEachInObject, isString } from '@glyph-cat/swiss-army-knife'
import { limit, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { ReactNode, createContext, useContext, useEffect, useMemo } from 'react'
import { RelinkSource } from 'react-relink'
import { IncidentReportStatus, IncidentReportType } from '~abstractions'
import { Field } from '~constants'
import { DBCollection } from '~services/firebase-client'
import { IArcadeInfo } from './abstractions'
import { ARCADE_LIST } from './list'

const ArcadeInfoContext = createContext<IArcadeInfo>(null)

const STORAGE_KEY = 'arcade-id'

export interface ArcadeInfoProviderProps {
  children: ReactNode | Array<ReactNode>
}

export function ArcadeInfoProvider({
  children,
}: ArcadeInfoProviderProps): JSX.Element {

  const { query: { a } = {} } = useRouter()

  const arcadeId = useMemo(() => {
    if (isString(a) && ARCADE_LIST[a]) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, String(a))
      }
      return a
    } else {
      if (typeof window !== 'undefined') {
        const persistedArcadeId = localStorage.getItem(STORAGE_KEY)
        if (persistedArcadeId) {
          return persistedArcadeId
        }
      }
    }
    return null
  }, [a])

  const fullArcadeInfo = useMemo(() => ({
    ...ARCADE_LIST[arcadeId],
    id: arcadeId,
  }), [arcadeId])

  return (
    <ArcadeInfoContext.Provider value={fullArcadeInfo}>
      {children}
    </ArcadeInfoContext.Provider>
  )
}

export function useArcadeInfo(): IArcadeInfo {
  return useContext(ArcadeInfoContext)
}

type IncidentReportFiltrationSchema = Partial<Record<IncidentReportType, Partial<Record<IncidentReportStatus, { [deviceKey: string]: DateTime }>>>>

export interface IIncidentReportTypeDetails {
  reportCount: number
  deviceKeys: Array<string>
  timestamp: Nullable<DateTime>
}

export const DEFAULT_INCIDENT_REPORT_TYPE_DETAIL_DATA: IIncidentReportTypeDetails = {
  reportCount: 0,
  deviceKeys: [],
  timestamp: null,
}

export interface IIncidentReportSource {
  hasOngoingIncidents: boolean
  data: Record<IncidentReportType, IIncidentReportTypeDetails>
}

export const IncidentReportSource = new RelinkSource<IIncidentReportSource>({
  key: 'incident-report',
  default: {
    hasOngoingIncidents: false,
    data: {
      [IncidentReportType.OTHER]: DEFAULT_INCIDENT_REPORT_TYPE_DETAIL_DATA,
      [IncidentReportType.CABINET_OFFLINE]: DEFAULT_INCIDENT_REPORT_TYPE_DETAIL_DATA,
      [IncidentReportType.MAINTENANCE_IN_PROGRESS]: DEFAULT_INCIDENT_REPORT_TYPE_DETAIL_DATA,
      [IncidentReportType.ARCADE_NOT_OPEN]: DEFAULT_INCIDENT_REPORT_TYPE_DETAIL_DATA,
      [IncidentReportType.POWER_OUTAGE]: DEFAULT_INCIDENT_REPORT_TYPE_DETAIL_DATA,
      [IncidentReportType.FLOOD]: DEFAULT_INCIDENT_REPORT_TYPE_DETAIL_DATA,
    },
  },
})

export function useIncidentReportRootListener(): void {
  const currentArcade = useArcadeInfo()
  useEffect(() => {
    if (!currentArcade) { return } // Early exit
    const unsubscribeListener = onSnapshot(
      query(
        DBCollection.IncidentReports,
        where(Field.arcadeId, '==', currentArcade.id),
        orderBy(Field.cTime),
        limit(30)
      ),
      async (querySnapshot) => {
        const filtrationData: IncidentReportFiltrationSchema = {}
        querySnapshot.forEach((doc) => {
          const {
            [Field.incidentReportStatus]: reportStatus,
            [Field.incidentReportType]: reportType,
            [Field.deviceKey]: reporterDeviceKey,
            [Field.cTime]: reportTime,
          } = doc.data()
          if (!filtrationData[reportType]) {
            filtrationData[reportType] = {}
          }
          if (!filtrationData[reportType][reportStatus]) {
            filtrationData[reportType][reportStatus] = {}
          }
          filtrationData[reportType][reportStatus][reporterDeviceKey] = reportTime
        })
        let hasOngoingIncidents = false
        const newStateData: Partial<IIncidentReportSource['data']> = {}
        forEachInObject(filtrationData, ({ key: reportType, value }) => {
          if (!newStateData[reportType]) {
            newStateData[reportType] = { ...DEFAULT_INCIDENT_REPORT_TYPE_DETAIL_DATA }
          }
          const {
            [IncidentReportStatus.ACTIVE]: activeReports = {},
            [IncidentReportStatus.RESOLVED]: resolvedReports = {},
          } = value
          const activeReportDeviceKeys = Object.keys(activeReports)
          const activeReportTimestamps = Object.values(activeReports)
          const activeReportCount = activeReportDeviceKeys.length
          const resolvedReportCount = Object.keys(resolvedReports).length
          newStateData[reportType] = {
            deviceKeys: activeReportDeviceKeys,
            timestamp: activeReportTimestamps.sort()[0],
            reportCount: resolvedReportCount > activeReportCount
              ? 0
              : activeReportCount,
          }
          hasOngoingIncidents = true
          // ^ As long as the iteration executes, it means there are ongoing incidents
        })
        await IncidentReportSource.set({
          ...IncidentReportSource.default,
          data: {
            ...IncidentReportSource.default.data,
            ...newStateData,
          },
          hasOngoingIncidents,
        })
      }
    )
    return () => { unsubscribeListener() }
  }, [currentArcade])
}

export * from './abstractions'
export * from './list'

