import { Field } from '~constants'
import { IBaseModelObject, IBaseSnapshot } from '../base'

export enum IncidentReportStatus {
  ACTIVE = 1,
  RESOLVED,
}

export enum IncidentReportType {
  /**
   * Miscellaneous reasons.
   */
  OTHER = 1,
  /**
   * Cabinets cannot connect to server for some reason.
   */
  CABINET_OFFLINE,
  /**
   * Arcade is open, but cabinets are not available for play due to maintenance.
   */
  MAINTENANCE_IN_PROGRESS,
  /**
   * Arcade not open during supposed operating hours.
   */
  ARCADE_NOT_OPEN,
  /**
   * Power outage.
   */
  POWER_OUTAGE,
  /**
   * Flood.
   */
  FLOOD,
}

export interface IIncidentReportsModelObject extends IBaseModelObject {
  [Field.arcadeId]: string
  [Field.deviceKey]: string
  [Field.incidentReportType]: IncidentReportType
  [Field.incidentReportStatus]: IncidentReportStatus
}

export interface IIncidentReportsSnapshot extends IBaseSnapshot {
  [Field.arcadeId]: IIncidentReportsModelObject[Field.arcadeId]
  [Field.deviceKey]: IIncidentReportsModelObject[Field.deviceKey]
  [Field.incidentReportType]: IIncidentReportsModelObject[Field.incidentReportType]
  [Field.incidentReportStatus]: IIncidentReportsModelObject[Field.incidentReportStatus]
}
