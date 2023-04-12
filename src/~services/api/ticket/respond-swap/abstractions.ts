import { SwapRequestStatus } from '~abstractions'
import { Field } from '~constants'

export interface APIRespondSwapRequestHandlerParams {
  [Field.swapRequestId]: string
  [Field.swapRequestStatus]: SwapRequestStatus.ACCEPTED | SwapRequestStatus.DECLINED
}

export type APIRespondSwapRequestHandlerReturnData = void

export type APIRespondSwapRequestReturnData = void
