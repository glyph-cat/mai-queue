import { concatClassNames, MaterialIcon } from '@glyph-cat/swiss-army-knife'
import { StepIndex } from '../../source'
import styles from './index.module.css'

export interface PaginationDotIndicatorProps {
  value: StepIndex
}

export function PaginationDotIndicator({
  value,
}: PaginationDotIndicatorProps): JSX.Element {

  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
        <div
          className={concatClassNames(
            styles.iconContainer,
            value === StepIndex.CONFIG ? styles.activeIndicator : null,
          )}
        >
          <MaterialIcon name='settings' size={12} />
        </div>
        <div
          className={concatClassNames(
            styles.dot,
            value === StepIndex.TAKE_TICKET ? styles.activeIndicator : null,
          )}
        />
        <div
          className={concatClassNames(
            styles.dot,
            value === StepIndex.SET_FRIEND_CODE ? styles.activeIndicator : null,
          )}
        />
      </div>
    </div>
  )
}
