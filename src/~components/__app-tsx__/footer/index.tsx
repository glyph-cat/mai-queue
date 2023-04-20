import Link from 'next/link'
import { useRouter } from 'next/router'
import { ENV, OPEN_IN_NEW_TAB_PROPS } from '~constants'
import { CLIENT_ROUTE } from '~services/navigation'
import styles from './index.module.css'

const isNotProductionEnv = ENV.VERCEL_ENV !== 'production'

export function Footer(): JSX.Element {
  const { route } = useRouter()
  return (
    <footer className={styles.container}>
      <div
        className={styles.subContainer}
        style={{
          marginBottom: `calc(env(safe-area-inset-bottom) + ${route === CLIENT_ROUTE.root ? 100 : 10}px)`,
        }}
      >
        <div style={{ gridAutoFlow: 'column', gap: 10 }}>
          <Link href={CLIENT_ROUTE.root}>Home</Link>
          <Link href={CLIENT_ROUTE.credits}>Credits</Link>
          <Link href={CLIENT_ROUTE.help}>Help</Link>
        </div>
        <Link href={CLIENT_ROUTE.privacyPolicy}>Privacy policy</Link>
        <Link href={CLIENT_ROUTE.termsConditions}>Terms & Conditions</Link>
        <Link href={ENV.GIT_REPO_HOMEPAGE} {...OPEN_IN_NEW_TAB_PROPS}>View on GitHub</Link>
        <span className={isNotProductionEnv ? styles.devVersionLabel : null}>
          {ENV.APP_VERSION ? `v${ENV.APP_VERSION}` : 'Version unknown'}
          {isNotProductionEnv && <span>{` (${ENV.VERCEL_ENV})`}</span>}
        </span>
      </div>
    </footer>
  )
}
