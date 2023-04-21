import { Nullable, isString } from '@glyph-cat/swiss-army-knife'
import { Transaction } from '@google-cloud/firestore'
import { DateTime } from 'luxon'
import { NextApiRequest } from 'next'
import { Field } from '~constants'
import { InvalidDeviceKeyError } from '~errors'
import { DBCollection } from '~services/firebase-admin'
import { devInfo } from '~utils/dev'

export function extractDeviceKeyFromHeader(
  reqOrDeviceKey: NextApiRequest | string
): string {
  const deviceKey = isString(reqOrDeviceKey)
    ? reqOrDeviceKey
    : String(reqOrDeviceKey.headers.device_key)
  if (!deviceKey) {
    throw new InvalidDeviceKeyError()
  }
  return deviceKey
}

export interface FetchedDeviceInfo {
  ctime: DateTime
  deviceKey: string
  friendCode: Nullable<string>
}

/**
 * @returns The device's info if valid, otherwise throws an {@link InvalidDeviceKeyError}.
 */
export async function getDeviceInfo(
  reqOrDeviceKey: NextApiRequest | string
): Promise<FetchedDeviceInfo> {
  devInfo(`Running: ${getDeviceInfo.name}`)
  const deviceKey = extractDeviceKeyFromHeader(reqOrDeviceKey)
  const querySnapshot = await DBCollection.Devices.doc(deviceKey).get()
  if (querySnapshot.exists) {
    const snapshotData = querySnapshot.data()
    return {
      ctime: snapshotData[Field.cTime],
      deviceKey,
      friendCode: snapshotData[Field.friendCode],
    }
  } else {
    throw new InvalidDeviceKeyError()
  }
}

/**
 * @returns The device's info if valid, otherwise throws an {@link InvalidDeviceKeyError}.
 */
export async function getDeviceInfoInTransaction(
  tx: Transaction,
  reqOrDeviceKey: NextApiRequest | string
): Promise<FetchedDeviceInfo> {
  devInfo(`Running: ${getDeviceInfoInTransaction.name}`)
  const deviceKey = extractDeviceKeyFromHeader(reqOrDeviceKey)
  const querySnapshot = await tx.get(DBCollection.Devices.doc(deviceKey))
  if (querySnapshot.exists) {
    const snapshotData = querySnapshot.data()
    return {
      ctime: snapshotData[Field.cTime],
      deviceKey,
      friendCode: snapshotData[Field.friendCode],
    }
  } else {
    throw new InvalidDeviceKeyError()
  }
}
