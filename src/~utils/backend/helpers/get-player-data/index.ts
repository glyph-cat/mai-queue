import { IS_DEBUG_ENV, pickRandom } from '@glyph-cat/swiss-army-knife'
import { DateTime } from 'luxon'
import puppeteer, { EventEmitter } from 'puppeteer'
import queryString from 'query-string'
import { DateTimeFormat, ENV, FIREBASE_STORAGE_BASE_URL, StorageBucketNames } from '~constants'
import { InvalidFriendCodeError } from '~errors'
import { STORAGE_BUCKET } from '~services/firebase-admin'
import { sanitizePlayerName } from '~utils/sanitize-player-name'

export interface PlayerDataObject {
  bannerUrl: string
  playerName: string
}

export async function getPlayerData(
  friendCode: string
): Promise<PlayerDataObject> {

  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
    defaultViewport: {
      height: pickRandom([600, 900, 675, 720, 900]),
      width: pickRandom([800, 1000, 1200, 1280, 1600]),
    },
  })
  const page = await browser.newPage()
  let debugListener: EventEmitter
  if (IS_DEBUG_ENV) {
    debugListener = page.on('console', async (msg) => {
      const msgArgs = msg.args()
      for (let i = 0; i < msgArgs.length; ++i) {
        // eslint-disable-next-line no-console
        console.log(await msgArgs[i].jsonValue())
      }
    })
  }

  // Login
  const loginUrl = 'https://lng-tgk-aime-gw.am-all.net/common_auth/login?site_id=maimaidxex&redirect_url=https://maimaidx-eng.com/maimai-mobile/&back_url=https://maimai.sega.com/'
  await page.goto(loginUrl, { waitUntil: 'networkidle0' })
  await page.click('span.c-button--openid--segaId')
  await page.type('#sid', ENV.SEGA_ID)
  await page.type('#password', ENV.SEGA_PW)
  await Promise.all([
    page.click('#btnSubmit'),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ])

  // Get player data
  const friendSearchUrl = queryString.stringifyUrl({
    url: 'https://maimaidx-eng.com/maimai-mobile/friend/search/searchUser',
    query: { friendCode },
  })
  await page.goto(friendSearchUrl, { waitUntil: 'networkidle0' })

  const bannerSelector = 'body > div.wrapper.main_wrapper.t_c > div.see_through_block.m_15.m_t_5.p_10.t_l.f_0.p_r > div.basic_block.p_10.f_0'
  try {
    await page.waitForSelector(bannerSelector, { timeout: 10000 })
  } catch (e) {
    const errorBannerText = await page.evaluate(() => {
      const errorBannerElement: HTMLDivElement = document.querySelector('body > div.wrapper.main_wrapper.t_c > div.see_through_block.m_15.p_15.f_14.t_c')
      return errorBannerElement.innerText
    })
    if (/wrong code/i.test(errorBannerText)) {
      throw new InvalidFriendCodeError()
    } else {
      await page.screenshot({ path: 'scnshot_' + DateTime.now().toFormat(DateTimeFormat.SCREENSHOT_DATE_TIME) + '.png' })
      throw e
    }
  }

  const userBanner = await page.$(bannerSelector)
  await page.evaluate(($bannerSelector) => {
    const bannerElement: HTMLDivElement = document.querySelector($bannerSelector)
    const seeThroughElement: HTMLDivElement = document.querySelector('.see_through_block')
    // body > div.wrapper.main_wrapper.t_c > div.see_through_block.m_15.m_t_5.p_10.t_l.f_0.p_r
    // document.body.style.backgroundColor = '#ffffff'
    document.body.style.backgroundColor = 'transparent'
    seeThroughElement.style.backgroundColor = 'transparent'
    bannerElement.style.backgroundColor = 'transparent'
    bannerElement.style.boxShadow = 'none'
  }, bannerSelector)
  const screenshot = await userBanner.screenshot({
    encoding: 'binary',
    omitBackground: true,
  })
  const screenshotName = `${friendCode}-${DateTime.now().toFormat(DateTimeFormat.SCREENSHOT_DATE_TIME)}.png`
  const file = STORAGE_BUCKET.file(`${StorageBucketNames.PlayerBannerScreenshots}/${screenshotName}`)
  await file.save(screenshot, {
    public: true,
    gzip: true,
    metadata: {
      contentType: 'image/png',
      cacheControl: 'public, max-age=31536000',
    },
  })
  const bannerUrl = [
    FIREBASE_STORAGE_BASE_URL,
    ENV.FIREBASE_STORAGE_BUCKET,
    StorageBucketNames.PlayerBannerScreenshots,
    screenshotName,
  ].join('/')

  const playerName = sanitizePlayerName(await page.evaluate(() => {
    const nameElement: HTMLDivElement = document.querySelector('.basic_block .name_block')
    return nameElement?.innerText || null
  }))

  if (debugListener) { debugListener.removeAllListeners() }

  return {
    bannerUrl,
    playerName,
  }

}

// /* eslint-disable no-console */
// const data = await page.evaluate(() => {
//   if (document.querySelector('.basic_block') === null) {
//     console.log('no basic block')
//     return null
//   }
//   return {
//     avatarUrl: (() => {
//       const avatarElement: HTMLImageElement = document.querySelector('.basic_block > img')
//       return avatarElement?.src || null
//     })(),
//     trophy: (() => {
//       const trophyDivElement: HTMLDivElement = document.querySelector('.basic_block .trophy_block')
//       return trophyDivElement.classList[1]
//     })(),
//     trophyText: (() => {
//       const trophyTextElement: HTMLSpanElement = document.querySelector('.basic_block .trophy_inner_block span')
//       return trophyTextElement?.innerText || null
//     })(),
//     playerName: (() => {
//       const nameElement: HTMLDivElement = document.querySelector('.basic_block .name_block')
//       return nameElement?.innerText || null
//     })(),
//     ratingScore: (() => {
//       const ratingScoreElement: HTMLDivElement = document.querySelector('.basic_block .rating_block')
//       return ratingScoreElement?.innerText ? Number(ratingScoreElement.innerText) : null
//     })(),
//     ratingScoreBgUrl: (() => {
//       const ratingScoreBgElement: HTMLImageElement = document.querySelector('.basic_block .f_r img')
//       return ratingScoreBgElement?.src || null
//     })(),
//     danImgUrl: (() => {
//       const danElement: HTMLImageElement = document.querySelector('.basic_block img.f_l.h_35')
//       return danElement?.src || null
//     })(),
//     classRankImgUrl: (() => {
//       const classRankImageElement: HTMLImageElement = document.querySelector('.basic_block img.p_l_10.h_35.f_l')
//       return classRankImageElement?.src || null
//     })(),
//     starCount: (() => {
//       const starDivElement: HTMLDivElement = document.querySelector('.basic_block > div > div.p_l_10.f_l.f_14')
//       return Number(starDivElement.innerText.replace(/[^0-9]/g, ''))
//     })()
//   }
// })
// /* eslint-enable no-console */
