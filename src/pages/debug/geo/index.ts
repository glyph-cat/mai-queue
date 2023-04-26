import { GetServerSidePropsResult } from 'next'
import { EmptyRecord } from '~abstractions'
import { ENV, VercelEnv } from '~constants'

export { default } from '~screens/debug-geo'

export function getServerSideProps(): GetServerSidePropsResult<EmptyRecord> {
  if (ENV.VERCEL_ENV === VercelEnv.PRODUCTION) {
    return {
      notFound: true,
    }
  } else {
    return {
      props: {},
    }
  }
}
