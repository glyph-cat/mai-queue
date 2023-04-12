import { HttpStatus } from '@glyph-cat/swiss-army-knife'
import { FatalErrorFallbackUI } from '~components/fallback-ui/fatal-error'

function PageNotFound(): JSX.Element {
  return (
    <FatalErrorFallbackUI
      httpCode={HttpStatus.NOT_FOUND}
      title='Page not found'
    />
  )
}

export default PageNotFound
