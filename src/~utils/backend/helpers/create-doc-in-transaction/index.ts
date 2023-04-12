import { HASH_CHARSET, getRandomHash } from '@glyph-cat/swiss-army-knife'
import {
  CollectionReference,
  DocumentData,
  DocumentReference,
  Transaction,
} from '@google-cloud/firestore'

/**
 * References:
 * - https://googleapis.dev/nodejs/firestore/latest/Transaction.html
 * - https://stackoverflow.com/a/55674368/5810737
 * - https://github.com/firebase/firebase-js-sdk/blob/73a586c92afe3f39a844b2be86086fddb6877bb7/packages/firestore/src/util/misc.ts#L36
 */
export async function createDocInTransaction<T = DocumentData>(
  tx: Transaction,
  collection: CollectionReference<T>,
  data: T
): Promise<DocumentReference<T>> {
  let newDocId: string
  let isIdInvalid = true
  let newDoc: DocumentReference<T>
  do {
    newDocId = getRandomHash(20, HASH_CHARSET.DEFAULT)
    newDoc = collection.doc(newDocId)
    const snapshot = await tx.get<T>(newDoc)
    if (!snapshot.exists) { isIdInvalid = false }
  } while (isIdInvalid)
  tx.create(newDoc, data)
  return newDoc
}
