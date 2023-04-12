import { Nullable } from '@glyph-cat/swiss-army-knife'
import { DateTime } from 'luxon'
import { CloseTicketReason } from '~abstractions/ticket'
import { VoteCollection } from '~abstractions/vote'

export enum QueueViewMode {
  CURRENT = 1,
  PAST,
}

export interface IQueueFetchingBaseSource {
  lastFetched: DateTime
  data: Array<IQueueTicket>
}

/**
 * Queue ticket interface used in the GUI.
 */
export interface IQueueTicket {
  id: string
  positionInQueue: Nullable<number>
  ticketNumber: number
  bannerUrl: Nullable<string>
  playerName: string
  deviceKey: string
  cTime: DateTime
  friendCode: Nullable<string>
  xTime: Nullable<DateTime>
  xReason: CloseTicketReason
  staleFlags: VoteCollection
  /**
   * Time when the ticket was first observed by the client. This value should
   * not change even when FireStore picks up new data for ticket.
   */
  firstObservationTime: DateTime
}
