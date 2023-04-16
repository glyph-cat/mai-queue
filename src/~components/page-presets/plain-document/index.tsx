import React, { ComponentType, ReactNode } from 'react'
import { PageTitle } from '~components/page-title'
import styles from './index.module.css'

export interface PlainDocumentPagePresetProps {
  title: string
  children: ReactNode | Array<ReactNode>
  elementBeforeTitle?: ComponentType
}

export function PlainDocumentPagePreset({
  title,
  children,
  elementBeforeTitle: ElementBeforeTitle,
}: PlainDocumentPagePresetProps): JSX.Element {
  return (
    <>
      <PageTitle value={title} />
      <div className={styles.container}>
        <div className={styles.contentContainer}>
          {ElementBeforeTitle && <ElementBeforeTitle />}
          <h1>{title}</h1>
          {children}
        </div>
      </div>
    </>
  )
}
