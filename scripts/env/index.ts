import { execSync } from 'child_process'
import { writeFileSync } from 'fs'
import { DO_NOT_MODIFY_WARNING, ENCODING_UTF_8 } from '../_constants_'
import { homepage, version } from '../../package.json'

const hash = `${execSync('git rev-parse --short HEAD').toString().trim()}`

writeFileSync(
  './src/~constants/env/data.scripted.ts',
  [
    DO_NOT_MODIFY_WARNING,
    `export const __SCRIPTED_GIT_COMMIT_SHA__ = '${hash}'`,
    `export const __SCRIPTED_APP_VERSION__ = '${version}'`,
    `export const __GIT_REPO_HOMEPAGE__ = '${homepage}'`,
    '',
  ].join('\n'),
  ENCODING_UTF_8
)
console.info('✅ Finished scripting compile-time constants')
