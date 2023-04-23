import type {
  ReadOnlyTransactionOptions,
  ReadWriteTransactionOptions,
  Transaction,
} from '@google-cloud/firestore'
import admin from 'firebase-admin'
import { ENV } from '~constants'
import { CustomAPIError } from '~errors'

let isFirebaseAppInitialized = false
if (!isFirebaseAppInitialized) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: ENV.FIREBASE_PROJECT_ID,
        clientEmail: ENV.FIREBASE_CLIENT_EMAIL,
        privateKey: ENV.FIREBASE_PRIVATE_KEY,
      }),
      storageBucket: ENV.FIREBASE_STORAGE_BUCKET,
    })
    isFirebaseAppInitialized = true
  } catch (e) {
    if (e.code !== 'app/duplicate-app') {
      throw e
    }
  }
}

export const DB = admin.firestore()
export const STORAGE_BUCKET = admin.storage().bucket()
export async function runTransaction<T>(
  updateFunction: (transaction: Transaction) => Promise<T>,
  transactionOptions?:
    | ReadWriteTransactionOptions
    | ReadOnlyTransactionOptions
): Promise<T> {
  const txResponse = await DB.runTransaction(async (transaction: Transaction): Promise<T> => {
    try {
      await updateFunction(transaction)
    } catch (e) {
      return Promise.resolve(e)
      // Abort transaction if it's an error other than due to too much contention.
      // Reference on data contention: https://firebase.google.com/docs/firestore/transaction-data-contention
      // Reference on how to abort: https://stackoverflow.com/a/51986647/5810737
      // Update: Seems like rejecting the promise doesn't work... [:facepalm:]
    }
  }, transactionOptions)
  if (txResponse instanceof CustomAPIError) {
    throw txResponse
  }
  return txResponse
}
