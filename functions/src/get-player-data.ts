import * as functions from 'firebase-functions'
import { Request, Response } from 'express'
import { DateTime } from 'luxon'
import puppeteer from 'puppeteer'
import { stringifyUrl } from 'query-string'
import {
  ENV,
  STORAGE_BUCKET,
  StorageBucketNames,
  sanitizePlayerName,
} from './bridge'
import { pickRandom } from './pick-random'

const SCREENSHOT_DATE_TIME_FORMAT = 'yyyyLLdd_HHmmss'

const FIREBASE_STORAGE_BASE_URL = 'https://storage.googleapis.com'

export async function getPlayerData(req: Request, res: Response): Promise<void> {

  functions.logger.log(`${req.headers?.api_key ? 'Received' : 'No'} api_key`)

  if (!ENV.APP_API_KEYS.includes(req.headers['api_key'] as string)) {
    res.send('INVALID_API_KEY')
    return // Early exit
  }

  functions.logger.log(`req.query?.f: ${req.query?.f}`)
  if (!req.query?.f) {
    res.send('INVALID_FRIEND_CODE')
    return // Early exit
  }

  const friendCode = String(req.query?.f)
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
    functions.logger.log('login success')

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
        return errorBannerElement.textContent
      })
      if (/wrong code/i.test(errorBannerText)) {
        res.send('INVALID_FRIEND_CODE')
        throw new Error('INVALID_FRIEND_CODE')
        // ^ Early exit; proceeds to `finally` block to cleanup Puppeteer.
      } else {
        throw e
      }
    }
    functions.logger.log('navigated to friend code page')

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
    functions.logger.log('taken snapshot for banner')

    // const debugScreenshot = await page.screenshot({
    //   encoding: 'binary',
    //   type: 'png',
    // })
    // const debugScreenshotName = `DEBUG-${DateTime.now().toFormat(SCREENSHOT_DATE_TIME_FORMAT)}.png`
    // const debugFile = STORAGE_BUCKET.file(`${StorageBucketNames.PlayerBannerScreenshots}/${debugScreenshotName}`)
    // await debugFile.save(debugScreenshot, {
    //   public: false,
    //   gzip: true,
    //   metadata: {
    //     contentType: 'image/png',
    //     cacheControl: 'public, max-age=31536000',
    //   },
    // })

    playerName = sanitizePlayerName(await page.evaluate(() => {
      const nameElement: HTMLDivElement = document.querySelector('.basic_block .name_block')
      return nameElement?.textContent || null
    }))
    functions.logger.log('extracted player name')

  } catch (e) {
    error = e
  } finally {
    await page.close()
    await browser.close()
  }

  if (error) { throw error }

  res.status(200).json({
    b: bannerUrl,
    n: playerName,
  })
}
