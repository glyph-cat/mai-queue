import { PlainDocumentPagePreset } from '~components/page-presets/plain-document'
import { OPEN_IN_NEW_TAB_PROPS } from '~constants'

function ThankYouScreen(): JSX.Element {
  return (
    <PlainDocumentPagePreset title='Credits'>
      <ul>
        <li>
          Special thanks to <a href={'https://github.com/GRA0007/deluxe-bot'} {...OPEN_IN_NEW_TAB_PROPS}><code>GRA0007/deluxe-bot</code></a> for giving inspiration for the approach to fetch player profile.
        </li>
        <li>
          and to all the other players that helped out with testing and provided feedback.
        </li>
      </ul>
    </PlainDocumentPagePreset>
  )
}

export default ThankYouScreen
