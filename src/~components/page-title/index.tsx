import Head from 'next/head'
import { PROJECT_NAME } from '~constants'

export interface PageTitleProps {
  value: string
}

export function PageTitle({
  value,
}: PageTitleProps): JSX.Element {
  return (
    <Head>
      <title>{`${value} | ${PROJECT_NAME}`}</title>
    </Head>
  )
}
