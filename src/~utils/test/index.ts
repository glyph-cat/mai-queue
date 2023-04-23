import { HttpMethod } from '@glyph-cat/swiss-army-knife'
import { NextApiRequest, NextApiResponse } from 'next'
import { ENV } from '~constants'

export interface CreateMockRequestConfig {
  method: HttpMethod
  query?: unknown
  body?: unknown
  deviceKey?: string
}

export function createMockRequest(config: CreateMockRequestConfig): NextApiRequest {
  return {
    headers: {
      api_key: ENV.APP_API_KEY,
      ...(config.deviceKey ? { device_key: config.deviceKey } : {}),
    },
  } as unknown as NextApiRequest
}

export interface SentData {
  code: number
  body: unknown
  isJson: boolean
}

export interface MockNextApiResponse extends NextApiResponse {
  sentData: {
    code: number
    body: unknown
    isJson: boolean
  }
}

export function createMockResponse(): MockNextApiResponse {
  const sentData: SentData = {
    code: null,
    body: null,
    isJson: null,
  }
  return {
    sentData,
    status(statusCode: number) {
      sentData.code = statusCode
      return {
        send(body: unknown): void {
          sentData.body = body
        },
        json(body: unknown): void {
          sentData.body = body
          sentData.isJson = true
        },
      }
    },
  } as MockNextApiResponse
}

export function createMockRequestResponse(config: CreateMockRequestConfig): [
  NextApiRequest,
  MockNextApiResponse
] {
  return [
    createMockRequest(config),
    createMockResponse(),
  ]
}
