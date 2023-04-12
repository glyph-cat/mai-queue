import {
  CollectionReference,
  DocumentReference,
  PartialWithFieldValue,
  Precondition,
  SetOptions,
  UpdateData,
  WithFieldValue,
  WriteBatch,
  WriteResult,
} from '@google-cloud/firestore'
import { DB } from '~services/firebase-admin'

export class BatchOperator {

  private batchList: Array<WriteBatch> = []
  private currentBatch = DB.batch()
  private currentBatchCount = 0

  private runCounterAndReloadBatchIfNecessary(): void {
    if (this.currentBatchCount >= 500) {
      this.batchList.push(this.currentBatch)
      this.currentBatch = DB.batch()
      this.currentBatchCount = 0
    }
    this.currentBatchCount++
  }

  create<T>(
    documentRef: DocumentReference<T>,
    data: WithFieldValue<T>
  ): WriteBatch {
    this.runCounterAndReloadBatchIfNecessary()
    return this.currentBatch.create(documentRef, data)
  }

  set<T>(
    documentRef: DocumentReference<T>,
    data: PartialWithFieldValue<T>,
    options: SetOptions
  ): WriteBatch {
    this.runCounterAndReloadBatchIfNecessary()
    return this.currentBatch.set(documentRef, data, options)
  }

  update<T>(
    documentRef: DocumentReference<T>,
    data: UpdateData<T>,
    precondition?: Precondition
  ): WriteBatch {
    this.runCounterAndReloadBatchIfNecessary()
    return this.currentBatch.update(documentRef, data, precondition)
  }

  delete(documentRef: DocumentReference): WriteBatch {
    this.runCounterAndReloadBatchIfNecessary()
    return this.currentBatch.delete(documentRef)
  }

  async deleteCollection(collectionRef: CollectionReference<unknown>): Promise<void> {
    const docRefs = await collectionRef.listDocuments()
    for (const doc of docRefs) {
      this.delete(doc)
    }
  }

  async commit(): Promise<void> {
    const commitStack: Array<Promise<WriteResult[]>> = []
    for (const batch of this.batchList) {
      commitStack.push(batch.commit())
    }
    await Promise.all(commitStack)
    this.batchList = []
    this.currentBatch = null
    this.currentBatchCount = 0
  }

}
