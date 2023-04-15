import * as functions from 'firebase-functions'
import { DateTime } from 'luxon'
import puppeteer from 'puppeteer'
import { stringifyUrl } from 'query-string'
import {
  ENV,
  STORAGE_BUCKET,
  StorageBucketNames,
  sanitizePlayerName,
} from './bridge'

const SCREENSHOT_DATE_TIME_FORMAT = 'yyyyLLdd_HHmmss'

const FIREBASE_STORAGE_BASE_URL = 'https://storage.googleapis.com'

export const getPlayerData = functions.https.onRequest(async (req, res) => {

  if (req.headers['api_key'] !== ENV.APP_API_KEY) {
    res.send('INVALID_API_KEY')
    return // Early exit
  }

  if (!req.query?.f) {
    res.send('INVALID_FRIEND_CODE')
    return // Early exit
  }

  const friendCode = String(req.query?.f)
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  let bannerUrl: string
  let playerName: string
  let error: unknown

  try {

    // Login
    const loginUrl = 'https://lng-tgk-aime-gw.am-all.net/common_auth/login?site_id=maimaidxex&redirect_url=https://maimaidx-eng.com/maimai-mobile/&back_url=https://maimai.sega.com/'
    await page.goto(loginUrl, { waitUntil: 'networkidle0' })
    await page.click('span.c-button--openid--segaId')
    await page.type('#sid', ENV.SEGA_ID)
    await page.type('#password', ENV.SEGA_PW)
    await Promise.all([
      page.click('#btnSubmit'),
      // page.waitForSelector('img[src="https://maimaidx-eng.com/maimai-mobile/img/menu_friend.png"]'),
      // body > div.wrapper.main_wrapper.t_c > header > div > div:nth-child(2) > a:nth-child(3) > img
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ])

    // Get player data
    const friendSearchUrl = stringifyUrl({
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
        res.send('INVALID_FRIEND_CODE')
        throw new Error('INVALID_FRIEND_CODE')
        // ^ Early exit; proceeds to `finally` block to cleanup Puppeteer.
      } else {
        await page.screenshot({ path: 'scnshot_' + DateTime.now().toFormat(SCREENSHOT_DATE_TIME_FORMAT) + '.png' })
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
      encoding: 'binary',
      omitBackground: true,
      type: 'png',
    })) as string | Buffer
    const screenshotName = `${friendCode}-${DateTime.now().toFormat(SCREENSHOT_DATE_TIME_FORMAT)}.png`
    const file = STORAGE_BUCKET.file(`${StorageBucketNames.PlayerBannerScreenshots}/${screenshotName}`)
    await file.save(screenshot, {
      public: true,
      gzip: true,
      metadata: {
        contentType: 'image/png',
        cacheControl: 'public, max-age=31536000',
      },
    })
    bannerUrl = [
      FIREBASE_STORAGE_BASE_URL,
      ENV.FIREBASE_STORAGE_BUCKET,
      StorageBucketNames.PlayerBannerScreenshots,
      screenshotName,
    ].join('/')

    playerName = sanitizePlayerName(await page.evaluate(() => {
      const nameElement: HTMLDivElement = document.querySelector('.basic_block .name_block')
      return nameElement?.innerText || null
    }))

  } catch (e) {
    error = e
  } finally {
    await page.close()
    await browser.close()
  }

  if (error) { throw error }

  res.status(200).json({
    bannerUrl,
    playerName,
  })
})