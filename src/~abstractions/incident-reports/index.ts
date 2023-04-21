import { Nullable } from '@glyph-cat/swiss-army-knife'
import { VoteCollection } from '~abstractions/vote'
import { Field } from '~constants'
import { IBaseModelObject, IBaseSnapshot } from '../base'

export enum IncidentReportType {
  /**
   * Miscellaneous reasons.
   */
  OTHER,
  /**
   * Arcade not open during supposed operating hours.
   */
  ARCADE_NOT_OPEN,
  /**
   * Cabinets cannot connect to server for some reason.
   */
  CABINET_OFFLINE,
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
  [Field.incidentReportType]: IncidentReportType
  [Field.incidentReportComment]: Nullable<string>
  [Field.votes]: VoteCollection
}

export interface IIncidentReportsSnapshot extends IBaseSnapshot {
  [Field.arcadeId]: IIncidentReportsModelObject[Field.arcadeId]
  [Field.incidentReportType]: IIncidentReportsModelObject[Field.incidentReportType]
  [Field.incidentReportComment]: IIncidentReportsModelObject[Field.incidentReportComment]
  [Field.votes]: IIncidentReportsModelObject[Field.votes]
}
