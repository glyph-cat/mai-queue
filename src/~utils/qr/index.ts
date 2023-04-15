import { isObject, isString } from '@glyph-cat/swiss-army-knife'
import { DateTime } from 'luxon'
import { useEffect, useState } from 'react'
import { Field } from '~constants'
import { aesDecrypt, aesEncrypt } from '~utils/cryptography'

export interface IDeviceKeyQR {
  [Field.cTime]: DateTime
  [Field.deviceKey]: string
}

export const QR_EXPIRY_DURATION = 10 // seconds

// /**
//  * @internal
//  */
// export function __replacer__(key: string, value: unknown): unknown {
//   // console.log({ key, value, isDateTime: DateTime.isDateTime(value) })
//   // if (DateTime.isDateTime(value)) {
//   //   return (value as DateTime).toSQL()
//   // }
//   return value
// }

/**
 * @internal
 */
export function __reviver__(key: string, value: unknown): unknown {
  if (key === Field.cTime) {
    return DateTime.fromISO(value as string)
  } else {
    return value
  }
}

function encryptDeviceKeyQR(data: IDeviceKeyQR): string {
  return aesEncrypt(JSON.stringify(data))
}

export function decryptDeviceKeyQR(qrValue: string): IDeviceKeyQR {
  const parsedData = JSON.parse(aesDecrypt(qrValue), __reviver__) as IDeviceKeyQR
  if (!isObject(parsedData) ||
    Object.keys(parsedData).length !== 2 ||
    !(Field.deviceKey in parsedData) ||
    !(Field.cTime in parsedData)
  ) { throw new Error('Invalid QR code') }
  return parsedData
}

function createDeviceKeyQRData(deviceKey: string): string {
  if (!isString(deviceKey)) { return } // Early exit
  return encryptDeviceKeyQR({
    [Field.cTime]: DateTime.now(),
    [Field.deviceKey]: deviceKey,
  })
}

export function useDeviceKeyQRValue(deviceKey: string): [qrValue: string, timeLeft: number] {
  const [state, setState] = useState(() => ({
    timeLeft: QR_EXPIRY_DURATION,
    qrValue: null,
  }))
  useEffect(() => {
    if (!isString(deviceKey)) { return } // Early exit
    setState((s) => ({ ...s, qrValue: createDeviceKeyQRData(deviceKey) }))
    const intervalRef = setInterval(() => {
      setState((s) => {
        let nextState = { ...s, timeLeft: s.timeLeft - 1 }
        if (nextState.timeLeft <= 0) {
          nextState = {
            timeLeft: QR_EXPIRY_DURATION,
            qrValue: createDeviceKeyQRData(deviceKey),
          }
        }
        return nextState
      })
    }, 1000)
    return () => { clearInterval(intervalRef) }
  }, [deviceKey])
  return [state.qrValue, state.timeLeft]
}
