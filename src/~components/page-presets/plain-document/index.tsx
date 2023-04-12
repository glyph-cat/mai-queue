import { ReactNode } from 'react'
import { PageTitle } from '~components/page-title'
import styles from './index.module.css'

export interface PlainDocumentPagePresetProps {
  title: string
  children: ReactNode | Array<ReactNode>
}

export function PlainDocumentPagePreset({
  title,
  children,
}: PlainDocumentPagePresetProps): JSX.Element {
  return (
    <>
      <PageTitle value={title} />
      <div className={styles.container}>
        <div className={styles.contentContainer}>
          <h1>{title}</h1>
          {children}
        </div>
      </div>
    </>
  )
}
