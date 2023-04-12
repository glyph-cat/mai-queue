import { GlobalStyles } from '~constants'
import { concatClassNames } from '@glyph-cat/swiss-army-knife'
import { QueueViewMode } from '~abstractions'
import styles from './index.module.css'

export interface EmptyListComponentProps {
  viewMode: QueueViewMode
}

export function EmptyListComponent({
  viewMode,
}: EmptyListComponentProps): JSX.Element {
  return (
    <div className={styles.container}>
      <div className={concatClassNames(
        GlobalStyles.dxShadow,
        styles.text,
      )}>
        {`The ${viewMode === QueueViewMode.CURRENT ? 'queue' : 'list'} is empty`}
      </div>
    </div>
  )
}
