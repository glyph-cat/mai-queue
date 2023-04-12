import { concatClassNames, isFunction } from '@glyph-cat/swiss-army-knife'
import { ReactNode, useCallback, useEffect, useInsertionEffect } from 'react'
import { useDelayedVisibility } from '~hooks/delayed-visibility'
import styles from './index.module.css'

export interface AnimatedBackdropProps {
  children?: ReactNode
  /**
   * @defaultValue `true`
   */
  visible?: boolean
  /**
   * @defaultValue `false`
   */
  tapOutsideToDismiss?: boolean
  /**
   * @defaultValue `false`
   */
  pressEscToDismiss?: boolean
  /**
   * Used in conjunction with `tapOutsideToDismiss` and/or `pressEscToDismiss`.
   */
  onDismiss?(): void
}

export function AnimatedBackdrop({
  children,
  visible = true,
  tapOutsideToDismiss,
  pressEscToDismiss,
  onDismiss,
}: AnimatedBackdropProps): JSX.Element {

  const delayedVisible = useDelayedVisibility(visible)

  const safelyDismiss = useCallback(() => {
    if (isFunction(onDismiss)) { onDismiss() }
  }, [onDismiss])

  const onPressDimmedLayer = useCallback(() => {
    if (tapOutsideToDismiss) {
      safelyDismiss()
    }
  }, [safelyDismiss, tapOutsideToDismiss])

  useEffect(() => {
    if (pressEscToDismiss) {
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') { safelyDismiss() }
      }
      window.addEventListener('keydown', onKeyDown)
      return () => { window.removeEventListener('keydown', onKeyDown) }
    }
  }, [onDismiss, pressEscToDismiss, safelyDismiss])

  useInsertionEffect(() => {
    document.body.classList.add(styles.noScroll)
    return () => {
      document.body.classList.remove(styles.noScroll)
    }
  }, [])

  return (
    <div className={styles.baseContainer}>
      <div
        className={concatClassNames(styles.baseContainer, styles.dimmedLayer)}
        style={{ opacity: delayedVisible ? 1 : 0 }}
        onClick={onPressDimmedLayer}
      />
      <div className={styles.childContainer}>
        {children}
      </div>
    </div>
  )
}
