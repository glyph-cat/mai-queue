import { HttpStatus } from '@glyph-cat/swiss-army-knife'
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import QS from 'query-string'
import { Field } from '~constants'
import { CLIENT_ROUTE } from '~services/navigation'

export { default } from '~screens/main'

export function getServerSideProps(
  context: GetServerSidePropsContext
): GetServerSidePropsResult<Record<string, never>> {
  let { [Field.arcadeId]: arcadeId } = context.query || {}
  arcadeId = String(arcadeId)

  // === Temporary code start ===
  // Temporary redirect, unless players from other arcades wish to adopt this system too.
  const FUNSCAPE_BAGAN_AJAM_ARCADE_ID = '1'
  if (String(arcadeId) === FUNSCAPE_BAGAN_AJAM_ARCADE_ID) {
    return { props: {} }
  } else {
    return {
      redirect: {
        destination: QS.stringifyUrl({
          url: CLIENT_ROUTE.root,
          query: { a: FUNSCAPE_BAGAN_AJAM_ARCADE_ID },
        }),
        statusCode: HttpStatus.TEMPORARY_REDIRECT,
      },
    }
  }
  // === Temporary code end ===

  // eslint-disable-next-line no-unreachable
  if (arcadeId) {
    return { props: {} }
  } else {
    return {
      redirect: {
        statusCode: HttpStatus.TEMPORARY_REDIRECT,
        destination: CLIENT_ROUTE.root,
      },
    }
  }
}
