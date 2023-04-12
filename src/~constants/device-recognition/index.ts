import UAParser from 'ua-parser-js'

export const IS_HUAWEI_DEVICE = (() => {
  const ua = new UAParser()
  const uaString = ua.getUA()
  return /huawei/gi.test(uaString)
})()
