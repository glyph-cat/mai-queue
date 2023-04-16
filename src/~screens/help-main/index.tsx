import Link from 'next/link'
import { PlainDocumentPagePreset } from '~components/page-presets/plain-document'
import { CLIENT_ROUTE } from '~services/navigation'

function HelpMainScreen(): JSX.Element {
  return (
    <PlainDocumentPagePreset title={'Help'}>
      <ul>
        <li>
          <Link href={CLIENT_ROUTE.help_friendCode}>
            {'How to find my friend code'}
          </Link>
        </li>
      </ul>
    </PlainDocumentPagePreset>
  )
}

export default HelpMainScreen
