export enum CustomWebWorkerBaseEventType {
  NOTIFICATION = 1,
}

export interface CustomWebWorkerBaseEventData {
  type: CustomWebWorkerBaseEventType
}

export interface CustomWebWorkerNotificationEventData extends CustomWebWorkerBaseEventData {
  key: string
  type: CustomWebWorkerBaseEventType.NOTIFICATION
  title: string
  message: string
  url?: string
}
