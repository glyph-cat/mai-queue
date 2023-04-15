import admin from 'firebase-admin'
import {
  APP_API_KEY,
  FIREBASE_STORAGE_BUCKET,
  SEGA_ID,
  SEGA_PW,
} from './bridge.secrets'

export const StorageBucketNames = {
  PlayerBannerScreenshots: 'PlayerBannerScreenshots',
} as const

export const DB = admin.firestore()
export const STORAGE_BUCKET = admin.storage().bucket()

export const ENV = {
  APP_API_KEY: APP_API_KEY,
  SEGA_ID: SEGA_ID,
  SEGA_PW: SEGA_PW,
  FIREBASE_STORAGE_BUCKET: FIREBASE_STORAGE_BUCKET,
} as const

export function sanitizePlayerName(value: string): string {
  let sanitizedValue = ''
  for (let i = 0; i < value.length; i++) {
    const char = value[i]
    sanitizedValue += DICTIONARY[char] ? DICTIONARY[char] : char
  }
  return sanitizedValue
}

const DICTIONARY = {
  'Ａ': 'A',
  'Ｂ': 'B',
  'Ｃ': 'C',
  'Ｄ': 'D',
  'Ｅ': 'E',
  'Ｆ': 'F',
  'Ｇ': 'G',
  'Ｈ': 'H',
  'Ｉ': 'I',
  'Ｊ': 'J',
  'Ｋ': 'K',
  'Ｌ': 'L',
  'Ｍ': 'M',
  'Ｎ': 'N',
  'Ｏ': 'O',
  'Ｐ': 'P',
  'Ｑ': 'Q',
  'Ｒ': 'R',
  'Ｓ': 'S',
  'Ｔ': 'T',
  'Ｕ': 'U',
  'Ｖ': 'V',
  'Ｗ': 'W',
  'Ｘ': 'X',
  'Ｙ': 'Y',
  'Ｚ': 'Z',
  'ａ': 'a',
  'ｂ': 'b',
  'ｃ': 'c',
  'ｄ': 'd',
  'ｅ': 'e',
  'ｆ': 'f',
  'ｇ': 'g',
  'ｈ': 'h',
  'ｉ': 'i',
  'ｊ': 'j',
  'ｋ': 'k',
  'ｌ': 'l',
  'ｍ': 'm',
  'ｎ': 'n',
  'ｏ': 'o',
  'ｐ': 'p',
  'ｑ': 'q',
  'ｒ': 'r',
  'ｓ': 's',
  'ｔ': 't',
  'ｕ': 'u',
  'ｖ': 'v',
  'ｗ': 'w',
  'ｘ': 'x',
  'ｙ': 'y',
  'ｚ': 'z',
  '０': '0',
  '１': '1',
  '２': '2',
  '３': '3',
  '４': '4',
  '５': '5',
  '６': '6',
  '７': '7',
  '８': '8',
  '９': '9',
  '・': '·',
  '：': ':',
  '；': ';',
  '？': '?',
  '！': '!',
  '～': '~',
  '／': '/',
  '＋': '+',
  '－': '-',
  '＝': '=',
  '＃': '#',
  '＆': '&',
  '＊': '*',
  '＠': '@',
  '＄': '$',
  '（': '(',
  '）': ')',
  '．': '.',
  '＿': '_',
  '　': ' ',
}
