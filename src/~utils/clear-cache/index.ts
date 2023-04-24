import { renderInPortal } from '@glyph-cat/swiss-army-knife'
import { CloseTicketReason } from '~abstractions'
import { LoadingCover } from '~components/loading-cover'
import { Field } from '~constants'
import { APIRevokeDeviceKey } from '~services/api/device/revoke-key'
import { APICloseTicket } from '~services/api/ticket/close'
import { NotificationSource } from '~services/notification'
import { ConfigSource } from '~sources/config'
import { DebugConfigSource } from '~sources/debug'
import { OutgoingSwapRequestSource } from '~sources/outgoing-swap-request-source/source'
import { UserPreferencesSource } from '~sources/user-preferences'
import { devError } from '~utils/dev'

export interface ClearCacheOptions {
  noReload?: boolean
  ticketId?: string
}

export async function clearCache({
  noReload,
  ticketId,
}: ClearCacheOptions = {}): Promise<void> {
  if (ticketId) {
    renderInPortal(LoadingCover, {})
    try {
      await APICloseTicket({
        [Field.ticketId]: ticketId,
        [Field.xReason]: CloseTicketReason.WITHDRAW,
      })
    } catch (e) {
      devError(e)
    }
  }
  await APIRevokeDeviceKey()
  await Promise.all([
    ConfigSource.reset(),
    DebugConfigSource.reset(),
    OutgoingSwapRequestSource.reset(),
    UserPreferencesSource.reset(),
    NotificationSource.reset(),
  ])
  sessionStorage.clear()
  localStorage.clear()
  if (!noReload) {
    window?.location?.reload()
  }
}
