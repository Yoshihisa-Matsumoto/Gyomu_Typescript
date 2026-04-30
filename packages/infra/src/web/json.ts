import { Effect } from 'effect';
import { Stream } from 'effect';
import { NetworkError } from '@gyomu/core';
import { fromSync } from '@gyomu/shared/effect';
import { ValueError } from '@gyomu/shared';

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
      fromSync(ValueError, (e) => ({
        message: 'invalid json',
        value: chunks,
      }))(() => JSON.parse(chunks.join('')) as T),
    ),
  );
