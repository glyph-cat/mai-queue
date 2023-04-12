import { GetServerSidePropsResult } from 'next'
import { ENV } from '~constants'

export { default } from '~screens/debug-geolocation'

export function getServerSideProps(): GetServerSidePropsResult<Record<string, never>> {
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
