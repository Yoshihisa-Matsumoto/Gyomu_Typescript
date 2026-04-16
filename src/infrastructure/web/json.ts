import { Effect } from 'effect';
import { Stream } from 'effect';
import { NetworkError, ValueError } from '../../errors.js';
import { fromSync } from '../../shared/effect/core.js';

export type FetchResult<ResponseType> = {
  value: ResponseType;
  code: number;
  extraAttribute?: any;
};
export const jsonEffect = <T>(
  stream: Stream.Stream<Uint8Array, NetworkError>,
): Effect.Effect<T, NetworkError | ValueError> =>
  stream.pipe(
    Stream.decodeText(),
    Stream.runCollect,
    Effect.flatMap((chunks) =>
      fromSync(
        ValueError,
        `Invalid JSON`,
      )(() => JSON.parse(chunks.join('')) as T),
    ),
  );
