export const FIREBASE_STORAGE_BASE_URL = 'https://storage.googleapis.com'

export const StorageBucketNames = {
  PlayerBannerScreenshots: 'PlayerBannerScreenshots',
} as const

export enum Collection {
  Devices = 'Devices',
  Tickets = 'Tickets',
  SwapRequests = 'SwapRequests',
  SubstituteActions = 'SubstituteActions',
  IncidentReports = 'IncidentReports',
}

// NOTE: `Field` is separated because we need to run a script on it
