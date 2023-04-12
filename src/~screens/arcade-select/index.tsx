import { useRouter } from 'next/router'
import QS from 'query-string'
import { useCallback, useMemo } from 'react'
import { TextButton } from '~components/form'
import { ARCADE_LIST } from '~services/arcade-info'
import { CLIENT_ROUTE } from '~services/navigation'
import { useTheme } from '~services/theme'
import styles from './index.module.css'

function ArcadeSelectScreen(): JSX.Element {
  const renderStack = []
  const { push } = useRouter()
  const { palette } = useTheme()
  const navigate = useCallback((url: string) => () => { push(url) }, [push])
  const sortedArcadeList = useMemo<typeof ARCADE_LIST>(() => {
    const list = [...ARCADE_LIST]
    // TODO: [Low priority] Sort to show nearest arcade at top of list
    return list
  }, [])
  for (let a = 1; a < sortedArcadeList.length; a++) {
    const arcadeInfo = sortedArcadeList[a]
    renderStack.push(
      <li key={a}>
        <TextButton
          key={a}
          onPress={navigate(QS.stringifyUrl({
            url: CLIENT_ROUTE.root,
            query: { a },
          }))}
          label={arcadeInfo.name}
          color={palette.primaryOrange}
        />
      </li>
    )
  }
  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
        <h1 className={styles.title}>Select an arcade</h1>
        <ul className={styles.ul}>
          {renderStack}
        </ul>
      </div>
    </div>
  )
}

export default ArcadeSelectScreen
