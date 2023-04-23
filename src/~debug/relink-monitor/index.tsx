import { RenderInClientOnly, concatClassNames } from '@glyph-cat/swiss-army-knife'
import { useEffect, useMemo, useState } from 'react'
import { useRelinkValue } from 'react-relink'
import { ENV } from '~constants'
import { StepWizardSource } from '~screens/queue/components/bottom-sheet/source'
import { IncidentReportSource } from '~services/arcade-info'
import { NotificationSource } from '~services/notification'
import { ConfigSource } from '~sources/config'
import { DebugConfigSource } from '~sources/debug'
import { IncomingSwapRequestSource } from '~sources/incoming-swap-request-source'
import { OutgoingSwapRequestSource } from '~sources/outgoing-swap-request-source'
import { UnstableSource } from '~sources/unstable'
import { UserPreferencesSource } from '~sources/user-preferences'
import styles from './index.module.css'

export function RelinkMonitor(): JSX.Element {
  if (ENV.VERCEL_ENV === 'production') { return null } // Early exit
  return (
    <RenderInClientOnly>
      <RelinkMonitorBase />
    </RenderInClientOnly>
  )
}

function RelinkMonitorBase(): JSX.Element {

  const [shouldShowOverlay, setOverlayVisibility] = useState(false)
  const [shouldBeInteractive, setInteractivity] = useState(true)
  useEffect(() => {
    if (ENV.VERCEL_ENV === 'production') { return } // Early exit
    const onKeyDown = (ev: KeyboardEvent) => {
      if (/^z$/i.test(ev.key)) {
        setOverlayVisibility(v => !v)
      } else if (/^`$/i.test(ev.key)) {
        setInteractivity(i => !i)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => { window.removeEventListener('keydown', onKeyDown) }
  }, [])

  const configState = useRelinkValue(ConfigSource, null, shouldShowOverlay)
  const debugConfigState = useRelinkValue(DebugConfigSource, null, shouldShowOverlay)
  const userPreferencesState = useRelinkValue(UserPreferencesSource, null, shouldShowOverlay)
  const incidentReportState = useRelinkValue(IncidentReportSource, null, shouldShowOverlay)
  const stepWizardState = useRelinkValue(StepWizardSource, null, shouldShowOverlay)
  const incomingSwapRequestState = useRelinkValue(IncomingSwapRequestSource, null, shouldShowOverlay)
  const outgoingSwapRequestState = useRelinkValue(OutgoingSwapRequestSource, null, shouldShowOverlay)
  const notificationState = useRelinkValue(NotificationSource, null, shouldShowOverlay)
  const unstableState = useRelinkValue(UnstableSource, null, shouldShowOverlay)

  const allStateData = useMemo(() => {
    return JSON.stringify({
      configState,
      debugConfigState,
      userPreferencesState,
      incidentReportState,
      stepWizardState,
      incomingSwapRequestState,
      outgoingSwapRequestState,
      notificationState,
      unstableState,
    }, null, 2)
  }, [configState, debugConfigState, incidentReportState, incomingSwapRequestState, notificationState, outgoingSwapRequestState, stepWizardState, unstableState, userPreferencesState])

  if (shouldShowOverlay) {
    return (
      <div className={concatClassNames(
        styles.container,
        shouldBeInteractive ? null : styles.containerNonInteractive,
      )}>
        <pre>
          <code>
            {allStateData}
          </code>
        </pre>
      </div>
    )
  }

}
