import { initializeApp } from 'firebase/app'
import { collection, getFirestore, QueryDocumentSnapshot } from 'firebase/firestore'
import {
  IIncidentReportsModelObject,
  IIncidentReportsSnapshot,
  ISwapRequestsModelObject,
  ISwapRequestsSnapshot,
  ITicketsModelObject,
  ITicketsSnapshot,
} from '~abstractions'
import { Collection, ENV, Field } from '~constants'
import { ClientCollectionWriteError } from '~errors'
import { safelyConvertToLuxonDatetime } from '~utils/data-sanitizer/client'
import { f } from '~utils/format-firestore-collection-name'

// Further reading: https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: ENV.FIREBASE_CLIENT_API_KEY,
  authDomain: ENV.FIREBASE_AUTH_DOMAIN,
  projectId: ENV.FIREBASE_PROJECT_ID,
  storageBucket: ENV.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: ENV.FIREBASE_MESSAGING_SENDER_ID,
  appId: ENV.FIREBASE_APP_ID,
  measurementId: ENV.FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const ClientDB = getFirestore(app)

export const DBCollection = {
  [Collection.Tickets]: collection(ClientDB, f(Collection.Tickets)).withConverter({
    toFirestore() {
      throw new ClientCollectionWriteError(Collection.Tickets)
    },
    fromFirestore(snapshot: QueryDocumentSnapshot<ITicketsSnapshot>): ITicketsModelObject {
      const snapshotData = snapshot.data()
      return {
        ...snapshotData,
        [Field.cTime]: safelyConvertToLuxonDatetime(snapshotData[Field.cTime]),
        [Field.xTime]: safelyConvertToLuxonDatetime(snapshotData[Field.xTime]),
      }
    },
  }),
  [Collection.SwapRequests]: collection(ClientDB, f(Collection.SwapRequests)).withConverter({
    toFirestore() {
      throw new ClientCollectionWriteError(Collection.SwapRequests)
    },
    fromFirestore(snapshot: QueryDocumentSnapshot<ISwapRequestsSnapshot>): ISwapRequestsModelObject {
      const snapshotData = snapshot.data()
      return {
        ...snapshotData,
        [Field.cTime]: safelyConvertToLuxonDatetime(snapshotData[Field.cTime]),
      }
    }
  }),
  [Collection.IncidentReports]: collection(ClientDB, f(Collection.IncidentReports)).withConverter({
    toFirestore() {
      throw new ClientCollectionWriteError(Collection.IncidentReports)
    },
    fromFirestore(snapshot: QueryDocumentSnapshot<IIncidentReportsSnapshot>): IIncidentReportsModelObject {
      const snapshotData = snapshot.data()
      return {
        ...snapshotData,
        [Field.cTime]: safelyConvertToLuxonDatetime(snapshotData[Field.cTime]),
      }
    }
  })
} as const
