import { Nullable } from '@glyph-cat/swiss-army-knife'

export interface IOutgoingSwapRequestSource {
  requestId: string
  sourceTicketId: string
  targetTicketId: string
  targetPlayerName: string
  targetPlayerBannerUrl: Nullable<string>
}
