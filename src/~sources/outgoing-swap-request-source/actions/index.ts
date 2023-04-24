import { Field } from '~constants'
import { APIRequestSwapTicket } from '~services/api/ticket/request-swap'
import { OutgoingSwapRequestSource } from '../source'

export async function onConfirmRequestSwapNumber(
  sourceTicketId: string,
  targetTicketId: string,
  targetPlayerName: string,
  targetPlayerBannerUrl: string
): Promise<void> {
  await OutgoingSwapRequestSource.set({
    requestId: null,
    sourceTicketId,
    targetTicketId,
    targetPlayerName,
    targetPlayerBannerUrl,
  })
}

export async function onSendRequestSwapNumber(
  sourceTicketId: string,
  targetTicketId: string,
): Promise<void> {
  const requestId = await APIRequestSwapTicket({
    [Field.sourceTicketId]: sourceTicketId,
    [Field.targetTicketId]: targetTicketId,
  })
  await OutgoingSwapRequestSource.set(s => ({ ...s, requestId }))
}
