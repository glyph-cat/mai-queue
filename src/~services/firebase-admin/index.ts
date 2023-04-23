import { Nullable } from '@glyph-cat/swiss-army-knife'
import { QueryDocumentSnapshot } from '@google-cloud/firestore'
import {
  IDeviceModelObject,
  IDeviceSnapshot,
  IIncidentReportsModelObject,
  IIncidentReportsSnapshot,
  ISwapRequestsModelObject,
  ISwapRequestsSnapshot,
  ITicketsModelObject,
  ITicketsSnapshot,
} from '~abstractions'
import { Collection, Field } from '~constants'
import {
  safelyConvertToFirestoreTimestamp,
  safelyConvertToLuxonDatetime,
} from '~utils/data-sanitizer/server'
import { f } from '~utils/format-firestore-collection-name'
import { NotZeroOrNull, NullableString } from '~utils/nullable'
import { DB } from './init'

export const DBCollection = {
  [Collection.Devices]: DB.collection(f(Collection.Devices)).withConverter({
    toFirestore(modelObject: IDeviceModelObject): IDeviceSnapshot {
      return {
        [Field.cTime]: safelyConvertToFirestoreTimestamp(modelObject[Field.cTime]),
        [Field.friendCode]: NullableString(modelObject[Field.friendCode]),
      }
    },
    fromFirestore(snapshot: QueryDocumentSnapshot<IDeviceSnapshot>): IDeviceModelObject {
      const snapshotData = snapshot.data()
      return {
        [Field.cTime]: safelyConvertToLuxonDatetime(snapshotData[Field.cTime]),
        [Field.friendCode]: Nullable(snapshotData[Field.friendCode]),
      }
    },
  }),
  [Collection.Tickets]: DB.collection(f(Collection.Tickets)).withConverter({
    toFirestore(modelObject: ITicketsModelObject): ITicketsSnapshot {
      return {
        [Field.arcadeId]: String(modelObject[Field.arcadeId]),
        [Field.ticketNumber]: Number(modelObject[Field.ticketNumber]),
        [Field.originalTicketNumber]: Number(modelObject[Field.originalTicketNumber]),
        [Field.cTime]: safelyConvertToFirestoreTimestamp(modelObject[Field.cTime]),
        [Field.deviceKey]: String(modelObject[Field.deviceKey]),
        [Field.bannerUrl]: NullableString(modelObject[Field.bannerUrl]),
        [Field.playerName]: NullableString(modelObject[Field.playerName]),
        [Field.friendCode]: NullableString(modelObject[Field.friendCode]),
        [Field.xTime]: safelyConvertToFirestoreTimestamp(modelObject[Field.xTime]),
        [Field.xReason]: NotZeroOrNull(modelObject[Field.xReason]),
        [Field.staleFlags]: modelObject[Field.staleFlags],
      }
    },
    fromFirestore(snapshot: QueryDocumentSnapshot<ITicketsSnapshot>): ITicketsModelObject {
      const snapshotData = snapshot.data()
      return {
        ...snapshotData,
        [Field.cTime]: safelyConvertToLuxonDatetime(snapshotData[Field.cTime]),
        [Field.xTime]: safelyConvertToLuxonDatetime(snapshotData[Field.xTime]),
        [Field.bannerUrl]: NullableString(snapshotData[Field.bannerUrl]),
        [Field.playerName]: NullableString(snapshotData[Field.playerName]),
        [Field.friendCode]: NullableString(snapshotData[Field.friendCode]),
      }
    },
  }),
  [Collection.SwapRequests]: DB.collection(f(Collection.SwapRequests)).withConverter({
    toFirestore(modelObject: ISwapRequestsModelObject): ISwapRequestsSnapshot {
      return {
        [Field.cTime]: safelyConvertToFirestoreTimestamp(modelObject[Field.cTime]),
        [Field.targetTicketId]: String(modelObject[Field.targetTicketId]),
        [Field.sourceTicketId]: String(modelObject[Field.sourceTicketId]),
        [Field.sourcePlayerName]: String(modelObject[Field.sourcePlayerName]),
        [Field.sourcePlayerBannerUrl]: NullableString(modelObject[Field.sourcePlayerBannerUrl]),
        [Field.swapRequestStatus]: Number(modelObject[Field.swapRequestStatus]),
        [Field.declineCount]: NotZeroOrNull(modelObject[Field.declineCount]),
      }
    },
    fromFirestore(snapshot: QueryDocumentSnapshot<ISwapRequestsSnapshot>): ISwapRequestsModelObject {
      const snapshotData = snapshot.data()
      return {
        ...snapshotData,
        [Field.cTime]: safelyConvertToLuxonDatetime(snapshotData[Field.cTime]),
        [Field.sourcePlayerBannerUrl]: NullableString(snapshotData[Field.sourcePlayerBannerUrl]),
      }
    },
  }),
  [Collection.IncidentReports]: DB.collection(f(Collection.IncidentReports)).withConverter({
    toFirestore(modelObject: IIncidentReportsModelObject): IIncidentReportsSnapshot {
      return {
        [Field.cTime]: safelyConvertToFirestoreTimestamp(modelObject[Field.cTime]),
        [Field.deviceKey]: String(modelObject[Field.deviceKey]),
        [Field.incidentReportType]: Number(modelObject[Field.incidentReportType]),
        [Field.arcadeId]: String(modelObject[Field.arcadeId]),
        [Field.incidentReportStatus]: Number(modelObject[Field.incidentReportStatus]),
      }
    },
    fromFirestore(snapshot: QueryDocumentSnapshot<IIncidentReportsSnapshot>): IIncidentReportsModelObject {
      const snapshotData = snapshot.data()
      return {
        ...snapshotData,
        [Field.cTime]: safelyConvertToLuxonDatetime(snapshotData[Field.cTime]),
      }
    },
  }),
} as const

export { DB, STORAGE_BUCKET } from './init'
