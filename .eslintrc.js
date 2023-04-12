const { configs } = require('@glyph-cat/eslint-config')

// const OFF = 0
// const ERROR = 2
const recommendedConfigs = configs.recommended

module.exports = {
  root: true,
  ...recommendedConfigs,
  extends: [
    ...recommendedConfigs.extends,
  ],
  rules: {
    ...recommendedConfigs.rules,
  },
}
