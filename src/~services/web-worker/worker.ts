import {
  CustomWebWorkerBaseEventData,
  CustomWebWorkerBaseEventType,
  CustomWebWorkerNotificationEventData,
} from './abstractions'

addEventListener('message', (event: MessageEvent<string>) => {
  const parsedData: CustomWebWorkerBaseEventData = JSON.parse(event.data)
  if (parsedData.type === CustomWebWorkerBaseEventType.NOTIFICATION) {
    const notificationData = parsedData as CustomWebWorkerNotificationEventData
    const notification = new Notification(notificationData.title)
    notification.onclick = () => {
      // TODO: [Low priority] open `notificationData.url`?
    }
  }
})
