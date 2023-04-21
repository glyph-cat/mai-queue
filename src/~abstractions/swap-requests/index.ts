import { Field } from '~constants'
import { IBaseModelObject, IBaseSnapshot } from '../base'

export enum SwapRequestStatus {
  CANCELLED,
  PENDING,
  DECLINED,
  ACCEPTED,
}

export interface ISwapRequestsModelObject extends IBaseModelObject {
  [Field.targetTicketId]: string
  [Field.sourceTicketId]: string
  [Field.sourcePlayerName]: string
  [Field.sourcePlayerBannerUrl]: string
  [Field.swapRequestStatus]: SwapRequestStatus
  [Field.declineCount]: number
}

export interface ISwapRequestsSnapshot extends IBaseSnapshot {
  [Field.targetTicketId]: ISwapRequestsModelObject[Field.targetTicketId]
  [Field.sourceTicketId]: ISwapRequestsModelObject[Field.sourceTicketId]
  [Field.sourcePlayerName]: ISwapRequestsModelObject[Field.sourcePlayerName]
  [Field.sourcePlayerBannerUrl]: ISwapRequestsModelObject[Field.sourcePlayerBannerUrl]
  [Field.swapRequestStatus]: ISwapRequestsModelObject[Field.swapRequestStatus]
  [Field.declineCount]: ISwapRequestsModelObject[Field.declineCount]
}
