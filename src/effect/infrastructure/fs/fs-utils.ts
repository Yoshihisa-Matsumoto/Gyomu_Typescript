import { FileSystem, OpenFlag } from 'effect/FileSystem';
import { Stream, Effect } from 'effect';
import { IOError, unknownError } from '../../../errors.js';
import { PlatformError } from 'effect/PlatformError';
import { AppError } from '../../../base-error.js';

/**
 * パスからファイルストリームを生成する。
 * 内部で FileSystem サービスを解決し、エラーを IOError にラップする。
 */
export const fileStream = (
  path: string,
): Stream.Stream<Uint8Array, IOError, FileSystem> =>
  Stream.unwrap(
    Effect.gen(function* () {
      const fs = yield* FileSystem;
      return fs
        .stream(path)
        .pipe(Stream.mapError((err) => unknownError(IOError, err)));
    }),
  );
// export const fileStream = (path: string) =>
//   NodeStream.fromReadable<Uint8Array, AppError>({
//     evaluate: () => fs.createReadStream(path),
//     onError: (e) => unknownError(IOError, e, 'file read error'),
//   });
/**
 * ストリームをファイルに書き出す汎用オペレーター
 */
export const writeToFile =
  (
    path: string,
    options?: {
      readonly flag?: OpenFlag | undefined;
      readonly mode?: number | undefined;
    },
  ) =>
  <E extends AppError, R>(
    self: Stream.Stream<Uint8Array, E, R>,
  ): Effect.Effect<void, E | IOError | PlatformError, R | FileSystem> =>
    Effect.gen(function* () {
      const fs = yield* FileSystem;
      console.log(`${path}`);
      return yield* Stream.run(self, fs.sink(path, options));
    });

/**
 * 文字列ストリームを UTF-8 でエンコードしてファイルに書き出すオペレーター
 */
export const writeTextToFile =
  (path: string) =>
  <E extends AppError, R>(
    self: Stream.Stream<string, E, R>,
  ): Effect.Effect<void, E | IOError | PlatformError, R | FileSystem> =>
    self.pipe(
      Stream.encodeText, // 内部で TextEncoder を使用 (UTF-8)
      writeToFile(path),
    );
