import { Effect, Stream } from 'effect'
import { fromSync } from '@gyomu/schema/effect'
import { ValueError } from '@gyomu/schema'
import type { NetworkError } from '@gyomu/schema'

/**
 * Defines a generic response container for fetch operations, including the typed data value, HTTP status code, and an optional extra attribute.
 */
export type FetchResult<ResponseType> = {
  value: ResponseType
  code: number
  extraAttribute?: any
}

/**
 * Processes a stream of bytes into a JSON-parsed object, potentially failing if the stream contains invalid JSON or network data.
 *
 * @param stream The incoming byte stream from a network operation.
 *
 * @returns An Effect that yields the parsed JSON object of type T upon success, or fails with a NetworkError or ValueError.
 */
export const jsonEffect = <T>(
  stream: Stream.Stream<Uint8Array, NetworkError>,
): Effect.Effect<T, NetworkError | ValueError> =>
  stream.pipe(
    Stream.decodeText(),
    Stream.runCollect,
    Effect.flatMap((chunks) =>
      fromSync(ValueError, () => ({
        message: 'invalid json',
        value: chunks,
      }))(() => JSON.parse(chunks.join('')) as T),
    ),
  )
