import { readdirSync, writeFileSync, existsSync } from 'fs'
import { DO_NOT_MODIFY_WARNING, ENCODING_UTF_8 } from '../_constants_'

const SOURCE_PATH = './src/pages/api'
const DESTINATION_PATH = './src/~services/navigation/routes/api.scripted.ts'

const fileStack = readdirSync(SOURCE_PATH, 'utf-8')

const variableBodyStack = []
for (let i = 0; i < fileStack.length; i++) {
  const currentFullPath = `${SOURCE_PATH}/${fileStack[i]}`
  if (isSingleAPIDirectory(currentFullPath)) {
    const currentApi = fileStack[i]
    const API_NAME = kebabCaseToMacroCase(currentApi)
    variableBodyStack.push(`  ${API_NAME}: \`\${CLIENT_ROUTE.api}/${currentApi}\`,`)
  } else {
    const subFileStack = readdirSync(currentFullPath, 'utf-8')
    for (let j = 0; j < subFileStack.length; j++) {
      const currentDirectory = fileStack[i]
      const currentApi = subFileStack[j]
      const API_NAME = kebabCaseToMacroCase(`${currentDirectory}_${currentApi}`)
      variableBodyStack.push(`  ${API_NAME}: \`\${CLIENT_ROUTE.api}/${currentDirectory}/${currentApi}\`,`)
    }
  }
}

const fileBody = [
  DO_NOT_MODIFY_WARNING,
  'import { CLIENT_ROUTE } from \'./client\'',
  '',
  'export const API_ROUTE = {',
  variableBodyStack.join('\n'),
  '} as const',
  '',
].join('\n')

writeFileSync(DESTINATION_PATH, fileBody, ENCODING_UTF_8)
console.info(`✅ Writen ${variableBodyStack.length} API routes`)

function kebabCaseToMacroCase(value: string): string {
  return value.replace(/-/g, '_').toUpperCase()
}

function isSingleAPIDirectory(path: string): boolean {
  return existsSync(`${path}/index.ts`) || existsSync(`${path}/index.tsx`)
}
