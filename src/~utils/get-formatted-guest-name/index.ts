export function getFormattedGuestName(originalTicketNumber: number): string {
  return `GUEST ${String(originalTicketNumber).padStart(2, '0')}`
}
