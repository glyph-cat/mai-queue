const { configs } = require('@glyph-cat/eslint-config')
const chalk = require('chalk')

const emphasize = chalk.bold.underline.cyan

// const OFF = 0
const ERROR = 2
const recommendedConfigs = configs.recommended

module.exports = {
  root: true,
  ...recommendedConfigs,
  extends: [
    ...recommendedConfigs.extends,
  ],
  rules: {
    ...recommendedConfigs.rules,
    'no-restricted-imports': [ERROR, {
      paths: [{
        name: '@glyph-cat/swiss-army-knife',
        importNames: ['devPrint', 'devInfo', 'devWarn', 'devError'],
        message: 'Please import from ' + emphasize('~utils/dev') + ' instead.'
      }],
    }],
  },
}
