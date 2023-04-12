import { Spinner } from '~components/spinner'
import styles from './index.module.css'

export function ListLoadingComponent(): JSX.Element {
  return (
    <div className={styles.container}>
      <div className={styles.paddingContainer}>
        <Spinner size={64} />
      </div>
    </div>
  )
}
