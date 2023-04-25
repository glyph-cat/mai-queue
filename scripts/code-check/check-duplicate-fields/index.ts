import { forEachInObject } from '@glyph-cat/swiss-army-knife'
import { readFileSync } from 'fs'
import { parse as parseJsonc } from 'jsonc-parser'
import { ENCODING_UTF_8 } from '../../_constants_'

const rawFileData = readFileSync('./src/~constants/field/index.ts', ENCODING_UTF_8)
  .replace(/^export enum Field /, '')
  .replace(/ = /g, ': ')
  .replace(/^\s{2}/gm, '  "')
  .replace(/: '/g, '": "')
  .replace(/',/g, '",')

const parsedData = parseJsonc(rawFileData)

const cache: Record<string, string> = {}
forEachInObject(parsedData, ({ key, value }) => {
  if (cache[value]) {
    throw new Error(`Duplicate value "${value}" with same keys "${cache[value]}", "${String(key)}"`)
  }
  cache[value] = String(key)
})
console.info('✅ No duplicate fields')
