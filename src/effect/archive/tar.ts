import tar from 'tar-stream';
import { Effect, Stream } from 'effect';
import { NodeStream } from '@effect/platform-node';
import { IOError, unknownError } from '../../errors.js';
import { Readable, pipeline } from 'node:stream';
import { AppError } from '../../base-error.js';

type TarEntry = {
  readonly header: tar.Headers;
  readonly content: Stream.Stream<Uint8Array, IOError>;
};

export const untar = (source: Stream.Stream<Uint8Array, AppError>) =>
  Stream.unwrap(
    Effect.gen(function* (_) {
      const extract = tar.extract();

      // 1. source (Effect Stream) を Node.js の Readable に変換
      const nodeReadable = yield* _(NodeStream.toReadable(source));

      // 2. Node.js の標準機能で流し込みを実行
      // pipeline を使うことで、エラーハンドリングと終了処理を Node に任せる
      yield* _(
        Effect.async<void, AppError>((resume) => {
          pipeline(nodeReadable, extract, (err) => {
            if (err)
              resume(Effect.fail(unknownError(IOError, err, 'Pipeline Error')));
            else resume(Effect.void);
          });
        }),
        Effect.fork, // バックグラウンドで実行
      );

      // 3. エントリを放出する Stream を返す
      return Stream.async<TarEntry, AppError>((emit) => {
        extract.on('entry', (header, stream, next) => {
          emit.single({
            header,
            content: NodeStream.fromReadable(
              () => stream as Readable,
              (e) =>
                unknownError(IOError, e, `Fail to read entry ${header.name}`),
            ),
          });

          next();
        });

        extract.on('finish', () => emit.end());
        extract.on('error', (e) =>
          emit.fail(unknownError(IOError, e, 'Tar Error')),
        );
      });
    }),
  );
