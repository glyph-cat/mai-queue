export enum Field {
  arcadeId = 'a',
  bannerUrl = 'b',
  sourcePlayerBannerUrl = 'bs',
  cTime = 'c', // Creation time (for any entity)
  deviceKey = 'd',
  declineCount = 'e', // for swap requests
  friendCode = 'f',
  staleFlags = 'g', // for tickets
  incidentReportId = 'id',
  incidentReportType = 'it',
  incidentReportComment = 'ic',
  playerName = 'n',
  ticketId = 't',
  ticketNumber = 'tn',
  originalTicketNumber = 'tno',
  sourceTicketId = 'ts', // for swap requests
  targetTicketId = 'tt', // for swap requests
  votes = 'v',
  voteType = 'vt', // Use to retrieve API params for now
  swapRequestId = 'w',
  swapRequestStatus = 'ws',
  xTime = 'x', // Termination time (or for tickets' case - closed time)
  xReason = 'y', // Termination reason (or for tickets' case - closed reason)
  sourcePlayerName = 'z', // for swap requests
}
