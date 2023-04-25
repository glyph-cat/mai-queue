import { readFileSync } from 'fs'
import { ENCODING_UTF_8 } from '../../_constants_'

const rawFileData = readFileSync('./src/~errors/list.ts', ENCODING_UTF_8)

const codes = rawFileData.match(/(?!static readonly code = )\d+/gm) || []

const duplicateCodeCache: Record<string, true> = {}
const codeCache: Record<string, true> = {}

for (let i = 0; i < codes.length; i++) {
  const code = codes[i]
  if (code !== String(i + 1)) {
    throw new Error(`Error is not in correct order at code '${code}'`)
  }
  if (codeCache[code]) {
    duplicateCodeCache[code] = true
  } else {
    codeCache[code] = true
  }
}

const duplicatedCodes = Object.keys(duplicateCodeCache)
if (duplicatedCodes.length > 0) {
  throw new Error(`Duplicated CustomAPIError codes: ${duplicatedCodes.join(', ')}`)
}

console.info('✅ No duplicate error codes')
