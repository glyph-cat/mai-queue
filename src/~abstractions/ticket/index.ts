import { Nullable } from '@glyph-cat/swiss-army-knife'
import { Timestamp } from '@google-cloud/firestore'
import { DateTime } from 'luxon'
import { VoteCollection } from '~abstractions/vote'
import { Field } from '~constants'
import { IBaseModelObject, IBaseSnapshot } from '../core'

export enum CloseTicketReason {
  CLOSE = 1,
  WITHDRAW,
  STALE,
}

export interface ITicketsModelObject extends IBaseModelObject {
  [Field.arcadeId]: string
  [Field.ticketNumber]: number
  [Field.originalTicketNumber]: number
  [Field.deviceKey]: string
  [Field.bannerUrl]: Nullable<string>
  [Field.playerName]: Nullable<string>
  [Field.friendCode]: Nullable<string>
  [Field.xTime]: Nullable<DateTime>
  [Field.xReason]: CloseTicketReason
  [Field.staleFlags]: VoteCollection
}

export interface ITicketsSnapshot extends IBaseSnapshot {
  [Field.arcadeId]: ITicketsModelObject[Field.arcadeId]
  [Field.ticketNumber]: ITicketsModelObject[Field.ticketNumber]
  [Field.originalTicketNumber]: ITicketsModelObject[Field.originalTicketNumber]
  [Field.deviceKey]: ITicketsModelObject[Field.deviceKey]
  [Field.bannerUrl]: ITicketsModelObject[Field.bannerUrl]
  [Field.playerName]: ITicketsModelObject[Field.playerName]
  [Field.friendCode]: ITicketsModelObject[Field.friendCode]
  [Field.xTime]: Nullable<Timestamp>
  [Field.xReason]: ITicketsModelObject[Field.xReason]
  [Field.staleFlags]: ITicketsModelObject[Field.staleFlags]
}
