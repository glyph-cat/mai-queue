import { Nullable } from '@glyph-cat/swiss-army-knife'

export interface IIncomingSwapRequestSource {
  requestId: string
  sourcePlayerBannerUrl: Nullable<string>
  sourcePlayerName: string
  sourceNumber: number
  targetNumber: number
}
