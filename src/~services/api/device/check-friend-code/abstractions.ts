import { Field } from '~constants'

export interface APICheckFriendCodeHandlerParams {
  [Field.friendCode]: string
}

export type APICheckFriendCodeHandlerReturnData = boolean

export type APICheckFriendCodeReturnData = boolean
