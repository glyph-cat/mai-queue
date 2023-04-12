import { AES, enc } from 'crypto-js'
import { ENV } from '~constants'

export function aesDecrypt(value: string): string {
  return AES.decrypt(value, ENV.APP_SALT).toString(enc.Utf8)
}

export function aesEncrypt(value: string): string {
  return AES.encrypt(value, ENV.APP_SALT).toString()
}
