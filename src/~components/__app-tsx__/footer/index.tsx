import Link from 'next/link'
import { useRouter } from 'next/router'
import { ReactNode } from 'react'
import { ENV, OPEN_IN_NEW_TAB_PROPS, VercelEnv } from '~constants'
import { CLIENT_ROUTE } from '~services/navigation'
import styles from './index.module.css'

const isNotProductionEnv = ENV.VERCEL_ENV !== VercelEnv.PRODUCTION

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
        <LinkGroup>
          <Link href={CLIENT_ROUTE.root}>Home</Link>
          <DotSeparator />
          <Link href={CLIENT_ROUTE.about}>About</Link>
          <DotSeparator />
          <Link href={CLIENT_ROUTE.help}>Help</Link>
          <DotSeparator />
          <Link href={CLIENT_ROUTE.credits}>Credits</Link>
        </LinkGroup>
        <LinkGroup>
          <Link href={CLIENT_ROUTE.privacyPolicy}>Privacy policy</Link>
          <DotSeparator />
          <Link href={CLIENT_ROUTE.termsConditions}>Terms & Conditions</Link>
          <DotSeparator />
          <Link href={ENV.GIT_REPO_HOMEPAGE} {...OPEN_IN_NEW_TAB_PROPS}>View on GitHub</Link>
        </LinkGroup>
        <span className={isNotProductionEnv ? styles.devVersionLabel : null}>
          {ENV.APP_VERSION ? `v${ENV.APP_VERSION}` : 'Version unknown'}
          {isNotProductionEnv && <span>{` (${ENV.VERCEL_ENV})`}</span>}
        </span>
      </div>
    </footer>
  )
}

interface LinkGroupProps { children: ReactNode | Array<ReactNode> }

function LinkGroup({ children }: LinkGroupProps): JSX.Element {
  return (
    <div style={{ gridAutoFlow: 'column', gap: 5 }}>
      {children}
    </div>
  )
}

function DotSeparator(): JSX.Element {
  return <>{'·'}</>
}
