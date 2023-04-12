import { concatClassNames } from '@glyph-cat/swiss-army-knife'
import { useCallback } from 'react'
import { QueueViewMode } from '~abstractions'
import { VISUAL_HEADER_SIZE } from '~components/__app-tsx__/visual-header'
import { useTheme } from '~services/theme'
import styles from './index.module.css'

export interface ViewModeTabsProps {
  value: QueueViewMode
  onChange(newValue: QueueViewMode): void
}

export function ViewModeTabs({
  value,
  onChange,
}: ViewModeTabsProps): JSX.Element {

  const onChangeHandler = useCallback((newValue: QueueViewMode) => {
    return () => { onChange(newValue) }
  }, [onChange])

  return (
    <div
      className={styles.container}
      style={{ top: VISUAL_HEADER_SIZE }}
    >
      <div className={styles.subContainer}>
        <div
          className={concatClassNames(
            styles.button,
            value === QueueViewMode.CURRENT ? styles.buttonSelected : styles.buttonPressable,
          )}
          onClick={onChangeHandler(QueueViewMode.CURRENT)}
        >
          {'Current'}
        </div>
        <div
          className={concatClassNames(
            styles.button,
            value === QueueViewMode.PAST ? styles.buttonSelected : styles.buttonPressable,
          )}
          onClick={onChangeHandler(QueueViewMode.PAST)}
        >
          {'History'}
        </div>
      </div>
    </div>
  )
}
