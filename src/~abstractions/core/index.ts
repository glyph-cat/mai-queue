import { Timestamp } from '@google-cloud/firestore'
import { DateTime } from 'luxon'
import { Field } from '~constants'

export interface IBaseModelObject {
  [Field.cTime]: DateTime
}

export interface IBaseSnapshot {
  [Field.cTime]: Timestamp
}
