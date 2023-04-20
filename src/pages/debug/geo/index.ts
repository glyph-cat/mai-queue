import { GetServerSidePropsResult } from 'next'
import { EmptyRecord } from '~abstractions'
import { ENV } from '~constants'

export { default } from '~screens/debug-geo'

export function getServerSideProps(): GetServerSidePropsResult<EmptyRecord> {
  if (ENV.VERCEL_ENV === 'production') {
    return {
      notFound: true,
    }
  } else {
    return {
      props: {},
    }
  }
}
