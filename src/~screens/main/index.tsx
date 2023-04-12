import { RenderInClientOnly } from '@glyph-cat/swiss-army-knife'
import ArcadeSelectScreen from '~screens/arcade-select'
import QueueScreen from '~screens/queue'
import { useArcadeInfo } from '~services/arcade-info'

function MainScreen(): JSX.Element {
  const currentArcade = useArcadeInfo()
  return (
    <RenderInClientOnly>
      {currentArcade ? <QueueScreen /> : <ArcadeSelectScreen />}
    </RenderInClientOnly>
  )
}

export default MainScreen
