import {
  MATERIAL_ICON_DEFAULTS,
  MaterialIconStyleSheet,
  PortalCanvas,
  RenderInClientOnly,
  useGlobalCSSVariableInjection,
  useThemeColor,
} from '@glyph-cat/swiss-army-knife'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { AppErrorBoundary } from '~components/__app-tsx__/app-error-boundary'
import { Footer } from '~components/__app-tsx__/footer'
import { IncomingSwapNumberRequestPopup } from '~components/__app-tsx__/incoming-swap-number-request-popup'
import { OnlineStatusBanner } from '~components/__app-tsx__/online-status-banner'
import { OutgoingSwapNumberRequestPopup } from '~components/__app-tsx__/outgoing-swap-number-request-popup'
import { VisualHeader } from '~components/__app-tsx__/visual-header'
import { WatchersAndListeners } from '~components/__app-tsx__/watchers-and-listeners'
import { LoadingCoverCanvas } from '~components/loading-cover'
import { ANIMATED_BACKDROP_TRANSITION_DURATION, PROJECT_NAME } from '~constants'
import { useVersioningMetadata } from '~hooks/versioning'
import { ArcadeInfoProvider } from '~services/arcade-info'
import { useTheme } from '~services/theme'
import '../styles/globals.css'

MATERIAL_ICON_DEFAULTS.variant = 'rounded'

function App({ Component, pageProps }: AppProps): JSX.Element {

  return null
  const { palette } = useTheme()
  useThemeColor(palette.basicBg)
  useGlobalCSSVariableInjection(palette)
  useGlobalCSSVariableInjection({
    animatedBackdropTransitionDuration: `${ANIMATED_BACKDROP_TRANSITION_DURATION / 1000}s`,
    dxShadow: '1px 3px 0px rgb(0 0 0 / 40%)',
  })
  useVersioningMetadata()

  return (
    <>
      <Head>
        <title>{PROJECT_NAME}</title>
        <meta name='viewport' content='width=device-width,initial-scale=1,user-scalable=yes,shrink-to-fit=no,viewport-fit=cover' />
      </Head>
      <AppErrorBoundary>
        <ArcadeInfoProvider>
          <RenderInClientOnly>
            <WatchersAndListeners />
          </RenderInClientOnly>
          <OnlineStatusBanner />
          <VisualHeader />
          <Component {...pageProps} />
          <LoadingCoverCanvas />
          <Footer />
          <RenderInClientOnly>
            <OutgoingSwapNumberRequestPopup />
            <IncomingSwapNumberRequestPopup />
            <PortalCanvas />
          </RenderInClientOnly>
        </ArcadeInfoProvider>
        <MaterialIconStyleSheet variants={['rounded']} />
      </AppErrorBoundary>
    </>
  )
}

export default App
