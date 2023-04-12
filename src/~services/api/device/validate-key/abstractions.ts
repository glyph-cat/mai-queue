import { Field } from '~constants'

export interface APIValidateDeviceKeyHandlerParams {
  [Field.deviceKey]: string
}

export type APIValidateDeviceKeyHandlerReturnData = boolean

export type APIValidateDeviceKeyReturnData = boolean
