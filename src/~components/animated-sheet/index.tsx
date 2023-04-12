import { concatClassNames } from '@glyph-cat/swiss-army-knife'
import { ReactNode } from 'react'
import { useDelayedVisibility } from '~hooks/delayed-visibility'
import styles from './index.module.css'

export interface AnimatedSheetProps {
  children: ReactNode
  /**
   * @defaultValue `true`
   */
  visible?: boolean
  /**
   * @defaultValue `undefined`
   */
  className?: string
}

export function AnimatedSheet({
  children,
  visible = true,
  className: additionalClassName,
}: AnimatedSheetProps): JSX.Element {
  const delayedVisible = useDelayedVisibility(visible)
  return (
    <div
      className={concatClassNames(
        styles.containerBase,
        delayedVisible ? styles.containerVisible : null,
        additionalClassName,
      )}
    >
      {children}
    </div>
  )
}
