import { IS_DEBUG_ENV, pickRandom } from '@glyph-cat/swiss-army-knife'
import { execSync } from 'child_process'
import { DateTime } from 'luxon'
import { ConsoleMessage, chromium } from 'playwright'
import queryString from 'query-string'
import {
  DateTimeFormat,
  ENV,
  FIREBASE_STORAGE_BASE_URL,
  StorageBucketNames,
} from '~constants'
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

  if (ENV.VERCEL_ENV !== 'localhost') {
    execSync('npx playwright install')
  }

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  })
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (iPad; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    viewport: {
      height: pickRandom([600, 900, 675, 720, 900]),
      width: pickRandom([800, 1000, 1200, 1280, 1600]),
    },
  })
  const page = await context.newPage()

  let onConsole: (msg: ConsoleMessage) => Promise<void>
  if (IS_DEBUG_ENV) {
    onConsole = async (msg: ConsoleMessage) => {
      const msgArgs = msg.args()
      for (let i = 0; i < msgArgs.length; ++i) {
        // eslint-disable-next-line no-console
        console.log(await msgArgs[i].jsonValue())
      }
    }
    page.on('console', onConsole)
  }

  // Login
  const loginUrl = 'https://lng-tgk-aime-gw.am-all.net/common_auth/login?site_id=maimaidxex&redirect_url=https://maimaidx-eng.com/maimai-mobile/&back_url=https://maimai.sega.com/'
  await page.goto(loginUrl, { waitUntil: 'networkidle' })
  await page.click('span.c-button--openid--segaId')
  await page.type('#sid', ENV.SEGA_ID)
  await page.type('#password', ENV.SEGA_PW)
  await Promise.all([
    page.click('#btnSubmit'),
    // page.waitForSelector('img[src="https://maimaidx-eng.com/maimai-mobile/img/menu_friend.png"]'),
    // body > div.wrapper.main_wrapper.t_c > header > div > div:nth-child(2) > a:nth-child(3) > img
    page.waitForNavigation({ waitUntil: 'networkidle' }),
  ])

  // Get player data
  const friendSearchUrl = queryString.stringifyUrl({
    url: 'https://maimaidx-eng.com/maimai-mobile/friend/search/searchUser',
    query: { friendCode },
  })
  await page.goto(friendSearchUrl, { waitUntil: 'networkidle' })

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
  const screenshot = (await userBanner.screenshot({
    omitBackground: true,
    type: 'png',
  })) as string | Buffer
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

  if (IS_DEBUG_ENV) { page.removeListener('console', onConsole) }
  await page.close()
  await browser.close()

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
