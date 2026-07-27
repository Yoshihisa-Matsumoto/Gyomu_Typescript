import { Effect, pipe } from 'effect'
import { NetworkError, ValueError } from '@gyomu/schema'
import { networkStream } from '../network/index.js'
import { fetchEffect, fetchStream } from './client.js'
import { parseXmlEffect, textEffect } from './xml.js'
import { jsonEffect } from './json.js'
import type { FetchResult } from './json.js'

/**
 * Sends a POST request with form-encoded data to the specified URL and parses the XML response.
 *
 * @returns An Effect that yields the parsed response value, HTTP status code, and any optional extra attributes upon success, or a NetworkError or ValueError upon failure.
 */
export function postAndReceiveXml<ResponseType>(
  url: string,
  input: Record<string, string>,
  option?: {
    headers?: Record<string, string>
    isValidData?: (obj: ResponseType) => boolean
    extraAttribute?: any
  },
): Effect.Effect<
  {
    value: ResponseType
    code: number
    extraAttribute?: any
  },
  NetworkError | ValueError
> {
  const headers: Record<string, string> = {
    ...(option?.headers ?? {}),
    'Content-Type': 'application/x-www-form-urlencoded',
  }

  const body = new URLSearchParams(input).toString()

  return Effect.gen(function* () {
    // =====================
    // fetch (statusも保持)
    // =====================
    const response = yield* fetchEffect(url, {
      method: 'POST',
      headers,
      body,
    })

    const statusCode = response.status

    if (!response.body) {
      return yield* Effect.fail(
        new NetworkError({
          message: 'No response body',
          cause: undefined,
          operation: 'request',
          retryable: false,
        }),
      )
    }

    // =====================
    // stream → text
    // =====================
    const text = yield* pipe(
      networkStream(() => response.body!, `Fetching XML from ${url}`),
      textEffect,
    )

    const resultData = yield* parseXmlEffect<ResponseType>(text)

    // =====================
    // validate
    // =====================
    if (option?.isValidData && !option.isValidData(resultData)) {
      return yield* Effect.fail(
        new ValueError({
          cause: undefined,
          message: 'Invalid Response data validation fail',
          value: resultData,
        }),
      )
    }

    return {
      value: resultData,
      code: statusCode,
      extraAttribute: option?.extraAttribute,
    }
  })
}
const validate =
  <A>(predicate?: (a: A) => boolean) =>
  (effect: Effect.Effect<A, NetworkError | ValueError>) =>
    effect.pipe(
      Effect.filterOrFail(
        (a) => predicate?.(a) ?? true,
        (a) =>
          new ValueError({
            message: `Invalid Response Data`,
            cause: undefined,
            value: a,
          }),
      ),
    )

/**
 * Sends a JSON HTTP request using the specified method and URL, then parses the JSON response.
 *
 * @returns An Effect that yields the parsed FetchResult on success, or a NetworkError or ValueError upon failure.
 */
export function fetchJson<RequestType, ResponseType>(
  url: string,
  method: 'GET' | 'POST' | 'DELETE' | 'PATCH',
  input: RequestType,
  option?: {
    headers?: Record<string, string>
    isValidData?: (obj: ResponseType) => boolean
    extraAttribute?: any
  },
): Effect.Effect<FetchResult<ResponseType>, NetworkError | ValueError> {
  let headers: Record<string, string>
  if (!option?.headers) {
    headers = { 'Content-Type': 'application/json' }
  } else {
    headers = option.headers
    headers['Content-Type'] = 'application/json'
  }

  const stream = fetchStream(
    url,
    input
      ? { method, headers: headers, body: JSON.stringify(input) }
      : { method, headers: headers },
  )
  return pipe(
    stream,
    jsonEffect<ResponseType>,
    validate(option?.isValidData),
    Effect.map((jsonData) => ({
      value: jsonData,
      code: 200, // ← 後述
      extraAttribute: option?.extraAttribute,
    })),
  )
}
