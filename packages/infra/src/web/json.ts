import { Effect, Stream } from 'effect'
import { fromSync } from '@gyomu/schema/effect'
import { ValueError } from '@gyomu/schema'
import type { NetworkError } from '@gyomu/schema'

export type FetchResult<ResponseType> = {
  value: ResponseType
  code: number
  extraAttribute?: any
}
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
