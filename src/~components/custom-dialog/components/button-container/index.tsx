import { Children, ReactNode } from 'react'
import styles from './index.module.css'

export interface CustomDialogButtonContainerProps {
  children: ReactNode
}

export function CustomDialogButtonContainer({
  children,
}: CustomDialogButtonContainerProps): JSX.Element {
  // Buttons will be displayed horizontally has two buttons, otherwise vertically.
  if (Children.count(children) === 2) {
    return (
      <div className={styles.simpleContainer}>
        {/* Reverse to show the important item on the right side */}
        {children[1]}
        {children[0]}
      </div>
    )
  } else {
    return (
      <div className={styles.complexContainer}>
        <div />
        <div className={styles.complexButtonsArea}>
          {children}
        </div>
      </div>
    )
  }
}

