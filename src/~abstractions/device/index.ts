import { Nullable } from '@glyph-cat/swiss-army-knife'
import { Field } from '~constants'
import { IBaseModelObject, IBaseSnapshot } from '../core'

export interface IDeviceModelObject extends IBaseModelObject {
  [Field.friendCode]: Nullable<string>
}

export interface IDeviceSnapshot extends IBaseSnapshot {
  [Field.friendCode]: IDeviceModelObject[Field.friendCode]
}
