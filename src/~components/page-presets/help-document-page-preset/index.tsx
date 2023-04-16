import { MaterialIcon } from '@glyph-cat/swiss-army-knife'
import Link from 'next/link'
import { ReactNode } from 'react'
import { CLIENT_ROUTE } from '~services/navigation'
import { PlainDocumentPagePreset } from '../plain-document'
import styles from './index.module.css'

export interface HelpDocumentPagePresetProps {
  title: string
  children: ReactNode | Array<ReactNode>
}

export function HelpDocumentPagePreset({
  title,
  children,
}: HelpDocumentPagePresetProps): JSX.Element {
  return (
    <PlainDocumentPagePreset
      elementBeforeTitle={BackToHelpButton}
      title={title}
    >
      {children}
      <BackToHelpButton />
    </PlainDocumentPagePreset>
  )
}

function BackToHelpButton(): JSX.Element {
  return (
    <Link href={CLIENT_ROUTE.help} style={{ textDecoration: 'none' }}>
      <div className={styles.helpButtonContainer}>
        <MaterialIcon name='chevron_left' />
        <span className={styles.label}>{'Back to Help'}</span>
      </div>
    </Link>
  )
}
