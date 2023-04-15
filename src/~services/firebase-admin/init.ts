import admin from 'firebase-admin'
import { ENV } from '~constants'
import {
  ReadWriteTransactionOptions,
  ReadOnlyTransactionOptions,
  Transaction,
} from '@google-cloud/firestore'

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
export function runTransaction<T>(
  updateFunction: (transaction: Transaction) => Promise<T>,
  transactionOptions?:
    | ReadWriteTransactionOptions
    | ReadOnlyTransactionOptions
): Promise<T> {
  const defaultOptions: ReadWriteTransactionOptions | ReadOnlyTransactionOptions = {
    maxAttempts: 3,
  }
  return DB.runTransaction(updateFunction, {
    ...transactionOptions,
    ...defaultOptions,
  })
}
