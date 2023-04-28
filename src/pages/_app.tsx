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
import { ArcadeInfoPopup } from '~components/__app-tsx__/arcade-info-popup'
import { Footer } from '~components/__app-tsx__/footer'
import { IncomingSwapNumberRequestPopup } from '~components/__app-tsx__/incoming-swap-number-request-popup'
import { OnlineStatusBanner } from '~components/__app-tsx__/online-status-banner'
import { OutgoingSwapNumberRequestPopup } from '~components/__app-tsx__/outgoing-swap-number-request-popup'
import { VisualHeader } from '~components/__app-tsx__/visual-header'
import { WatchersAndListeners } from '~components/__app-tsx__/watchers-and-listeners'
import { LoadingCoverCanvas } from '~components/loading-cover'
import { ANIMATED_BACKDROP_TRANSITION_DURATION, PROJECT_NAME } from '~constants'
import { ArcadeInfoProvider } from '~services/arcade-info'
import { useTheme } from '~services/theme'
import { RelinkInspector } from '~unstable/relink-inspector'
import '../styles/globals.css'

MATERIAL_ICON_DEFAULTS.variant = 'rounded'

function App({ Component, pageProps }: AppProps): JSX.Element {

  const { palette } = useTheme()
  useThemeColor(palette.basicBg)
  useGlobalCSSVariableInjection(palette)
  useGlobalCSSVariableInjection({
    animatedBackdropTransitionDuration: `${ANIMATED_BACKDROP_TRANSITION_DURATION / 1000}s`,
    dxShadow: '1px 3px 0px rgb(0 0 0 / 40%)',
  })

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
          <Footer />
          <RenderInClientOnly>
            <OutgoingSwapNumberRequestPopup />
            <IncomingSwapNumberRequestPopup />
            <ArcadeInfoPopup />
            <PortalCanvas />
            <LoadingCoverCanvas />
          </RenderInClientOnly>
        </ArcadeInfoProvider>
        <MaterialIconStyleSheet variants={['rounded']} />
        <RelinkInspector />
      </AppErrorBoundary>
    </>
  )
}

export default App
