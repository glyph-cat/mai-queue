import { HttpMethod } from '@glyph-cat/swiss-army-knife'
import { NextApiRequest, NextApiResponse } from 'next'
import { SwapRequestStatus } from '~abstractions'
import { Field } from '~constants'
import {
  DeviceKeyMismatchError,
  MissingParameterError,
  SwapRequestAlreadyClosedError,
  SwapRequestNotFoundError,
  TicketNotFoundError,
} from '~errors'
import { DBCollection } from '~services/firebase-admin'
import { runTransaction } from '~services/firebase-admin/init'
import { performBasicChecks } from '~utils/backend/helpers'
import { getDeviceInfoInTransaction } from '~utils/backend/helpers/get-device-info'
import {
  emptyResponse,
  genericTryCatchErrorResponseHandler,
} from '~utils/backend/response-handlers'
import { devInfo } from '~utils/dev'
import { APICancelSwapRequestHandlerParams } from './abstractions'

export default async function APICancelSwapTicketHandler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  devInfo(`Invoked ${APICancelSwapTicketHandler.name}`)
  try {
    performBasicChecks(req, [HttpMethod.DELETE])

    const {
      [Field.swapRequestId]: swapRequestId,
    } = req.query as unknown as APICancelSwapRequestHandlerParams

    if (!swapRequestId) {
      throw new MissingParameterError(Field.swapRequestId)
    }

    await runTransaction(async (tx) => {
      const deviceInfo = await getDeviceInfoInTransaction(tx, req)

      const swapRequestQuery = await tx.get(DBCollection.SwapRequests.doc(swapRequestId))
      if (!swapRequestQuery.exists) {
        throw new SwapRequestNotFoundError()
      }
      const swapRequestData = swapRequestQuery.data()
      if (swapRequestData[Field.swapRequestStatus] !== SwapRequestStatus.PENDING) {
        throw new SwapRequestAlreadyClosedError(swapRequestData[Field.swapRequestStatus])
      }
      const sourceTicketQuery = await tx.get(DBCollection.Tickets.doc(
        swapRequestData[Field.sourceTicketId]
      ))
      if (!sourceTicketQuery.exists) {
        throw new TicketNotFoundError(swapRequestData[Field.sourceTicketId])
      }
      const sourceTicketData = sourceTicketQuery.data()
      if (sourceTicketData[Field.deviceKey] !== deviceInfo.deviceKey) {
        throw new DeviceKeyMismatchError()
      }

      tx.update(DBCollection.SwapRequests.doc(swapRequestId), {
        [Field.swapRequestStatus]: SwapRequestStatus.CANCELLED,
      })

    })

    return emptyResponse(res)
  } catch (e) {
    return genericTryCatchErrorResponseHandler(res, e)
  }
}
