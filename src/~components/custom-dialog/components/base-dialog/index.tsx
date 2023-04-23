import { concatClassNames, delay } from '@glyph-cat/swiss-army-knife'
import { Component as ReactComponent, ReactNode } from 'react'
import { AnimatedBackdrop } from '~components/animated-backdrop'
import { AnimatedSheet } from '~components/animated-sheet'
import { ANIMATED_BACKDROP_TRANSITION_DURATION } from '~constants'
import styles from './index.module.css'

export interface BaseDialogProps {
  title: ReactNode
  description: ReactNode
  disableMidPadding?: boolean
  children: ReactNode
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
    const {
      title,
      description,
      children,
      onDismiss,
      easyDismiss,
      disableMidPadding,
    } = this.props
    return (
      <AnimatedBackdrop
        visible={this.state.isVisible}
        onDismiss={onDismiss}
        tapOutsideToDismiss={easyDismiss}
      >
        <AnimatedSheet
          visible={this.state.isVisible}
          className={concatClassNames(styles.sizingDefault, styles.contentContainer)}
        >
          {title && (<span className={styles.title}>{title}</span>)}
          {description && (
            <span className={styles.description}>
              {description}
            </span>
          )}
          {!disableMidPadding && <div style={{ height: 20 }} />}
          {children}
        </AnimatedSheet>
      </AnimatedBackdrop>
    )
  }

}
