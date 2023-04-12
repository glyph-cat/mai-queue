import { concatClassNames, delay } from '@glyph-cat/swiss-army-knife'
import { Component as ReactComponent, ReactNode } from 'react'
import { AnimatedBackdrop } from '~components/animated-backdrop'
import { AnimatedSheet } from '~components/animated-sheet'
import { ANIMATED_BACKDROP_TRANSITION_DURATION } from '~constants'
import styles from './index.module.css'

export interface BaseDialogProps {
  title: ReactNode
  description: ReactNode
  children: ReactNode
  dialogSize: BaseDialogSize
  onDismiss(): void
  easyDismiss?: boolean
}

export interface BaseDialogState {
  isVisible: boolean
}

export class BaseDialog extends ReactComponent<BaseDialogProps, BaseDialogState> {

  state = {
    isVisible: true,
  }

  hide = async (): Promise<void> => {
    this.setState({ isVisible: false })
    await delay(ANIMATED_BACKDROP_TRANSITION_DURATION)
  }

  render(): ReactNode {
    const { title, description, children, dialogSize, onDismiss, easyDismiss } = this.props
    const baseDialogSizeStyles = sizingStyles[dialogSize] || sizingStyles[BaseDialogSize.default]
    return (
      <AnimatedBackdrop
        visible={this.state.isVisible}
        onDismiss={onDismiss}
        tapOutsideToDismiss={easyDismiss}
      >
        <AnimatedSheet
          visible={this.state.isVisible}
          className={concatClassNames(baseDialogSizeStyles, styles.contentContainer)}
        >
          {title && (<span className={styles.title}>{title}</span>)}
          {description && (
            <span className={styles.description}>
              {description}
            </span>
          )}
          <div style={{ height: 20 }} />
          {children}
        </AnimatedSheet>
      </AnimatedBackdrop>
    )
  }

}

export enum BaseDialogSize {
  free = 1,
  default,
  large,
  extraLarge,
}

const sizingStyles = {
  [BaseDialogSize.default]: styles.sizingDefault,
  [BaseDialogSize.large]: styles.sizingLarge,
  [BaseDialogSize.extraLarge]: styles.sizingExtraLarge,
} as const
