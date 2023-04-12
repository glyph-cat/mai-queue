import { HttpStatus } from '@glyph-cat/swiss-army-knife'
import { FatalErrorFallbackUI } from '~components/fallback-ui/fatal-error'

function InternalErrorPage(): JSX.Element {
  // TODO: [Low priority] Can be improved
  // https://nextjs.org/docs/advanced-features/custom-error-page#500-page
  return (
    <FatalErrorFallbackUI
      httpCode={HttpStatus.INTERNAL_ERROR}
      title='Internal error'
    />
  )
}

export default InternalErrorPage
