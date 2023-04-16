import { MaterialIcon } from '@glyph-cat/swiss-army-knife'
import Image from 'next/image'
import { HelpDocumentPagePreset } from '~components/page-presets/help-document-page-preset'
import { OPEN_IN_NEW_TAB_PROPS } from '~constants'
import img01login from './assets/01-login.webp'
import img02friends from './assets/02-friends.webp'
import img03codeButton from './assets/03-code-button.webp'
import img04codeDisplay from './assets/04-code-display.webp'
import styles from './index.module.css'

const maimaidx = 'https://maimaidx-eng.com'

function HelpFriendCodeScreen(): JSX.Element {

  return (
    <HelpDocumentPagePreset title={'How to find my friend code'}>
      <ol>
        <li>
          Visit <a href={maimaidx} {...OPEN_IN_NEW_TAB_PROPS}>{maimaidx}<MaterialIcon name='open_in_new' size={14} /></a>.
        </li>
        <li>
          Login with your preferred method.
          <div className={styles.imageContainer} style={{ minHeight: 500 }}>
            <Image
              src={img01login}
              alt='maimaidx login page'
              style={{ objectFit: 'contain' }}
              fill
            />
          </div>
        </li>
        <li>
          {'Click on "FRIENDS".'}
          <div className={styles.imageContainer} style={{ minHeight: 200 }}>
            <Image
              src={img02friends}
              alt='Friends section'
              style={{ objectFit: 'contain' }}
              fill
            />
          </div>
        </li>
        <li>
          {'Click on "Your FRIEND CODE".'}
          <div className={styles.imageContainer} style={{ minHeight: 250 }}>
            <Image
              src={img03codeButton}
              alt='Friend code button'
              style={{ objectFit: 'contain' }}
              fill
            />
          </div>
        </li>
        <li>
          {'The numbers in the middle are your friend code.'}
          <div className={styles.imageContainer} style={{ minHeight: 300 }}>
            <Image
              src={img04codeDisplay}
              alt='Friend code'
              style={{ objectFit: 'contain' }}
              fill
            />
          </div>
        </li>
      </ol>
    </HelpDocumentPagePreset>
  )
}

export default HelpFriendCodeScreen
