import { FileSystem } from 'effect';
import { Stream, Effect } from 'effect';
import { IOError, NetworkError } from '../../errors.js';
import { PlatformError } from 'effect/PlatformError';
import { wrapInfraError } from '@gyomu/shared';
import ps from 'path';
import { unknown } from 'effect/SchemaAST';

/**
 * パスからファイルストリームを生成する。
 * 内部で FileSystem サービスを解決し、エラーを IOError にラップする。
 */
export const fileStream = (
  path: string,
): Stream.Stream<Uint8Array, IOError, FileSystem.FileSystem> =>
  Stream.unwrap(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      return fs
        .stream(path)
        .pipe(Stream.mapError((err) => wrapInfraError(IOError, err)));
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
export const writeStreamToFile =
  (
    path: string,
    options?: {
      readonly flag?: FileSystem.OpenFlag | undefined;
      readonly mode?: number | undefined;
    },
  ) =>
  <R>(
    self: Stream.Stream<Uint8Array, IOError | NetworkError, R>,
  ): Effect.Effect<void, IOError, R | FileSystem.FileSystem> =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      console.log(`${path}`);
      //return yield* Stream.run(self, fs.sink(path, options));
      return yield* self.pipe(Stream.run(fs.sink(path, options))).pipe(
        Effect.mapError((e) =>
          wrapInfraError(IOError, e, () => ({
            message: 'fail to write stream into file',
            target: path,
            operation: 'write' as const,
            layer: 'filesystem' as const,
          })),
        ),
      );
    });

/**
 * 文字列ストリームを UTF-8 でエンコードしてファイルに書き出すオペレーター
 */
export const writeTextStreamToFile =
  (path: string) =>
  <R>(
    self: Stream.Stream<string, IOError, R>,
  ): Effect.Effect<void, IOError | PlatformError, R | FileSystem.FileSystem> =>
    self.pipe(
      Stream.encodeText, // 内部で TextEncoder を使用 (UTF-8)
      writeStreamToFile(path),
    );

export const openFile = (
  path: string,
  options?: {
    readonly flag?: FileSystem.OpenFlag | undefined;
    readonly mode?: number | undefined;
  },
) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    return yield* fs.open(path, options).pipe(
      Effect.mapError((e) =>
        wrapInfraError(IOError, e, () => ({
          message: 'fail to open file',
          target: path,
          layer: 'filesystem' as const,
          operation: 'open' as const,
        })),
      ),
    );
  });
export const writeToFile = (
  path: string,
  data: Uint8Array<ArrayBufferLike>,
  options?: {
    readonly flag?: FileSystem.OpenFlag | undefined;
    readonly mode?: number | undefined;
  },
) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    return yield* fs.writeFile(path, data, options).pipe(
      Effect.mapError((e) =>
        wrapInfraError(IOError, e, () => ({
          message: 'fail to write file',
          target: path,
          layer: 'filesystem' as const,
          operation: 'write' as const,
        })),
      ),
    );
  });
export const writeStringToFile = (
  path: string,
  data: string,
  options?: {
    readonly flag?: FileSystem.OpenFlag | undefined;
    readonly mode?: number | undefined;
  },
) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    return yield* fs.writeFileString(path, data, options).pipe(
      Effect.mapError((e) =>
        wrapInfraError(IOError, e, () => ({
          message: 'fail to write file',
          target: path,
          layer: 'filesystem' as const,
          operation: 'write' as const,
        })),
      ),
    );
  });
export const readFromFile = (path: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    return yield* fs.readFile(path).pipe(
      Effect.mapError((e) =>
        wrapInfraError(IOError, e, () => ({
          message: 'fail to read from file',
          target: path,
          layer: 'filesystem' as const,
          operation: 'read' as const,
        })),
      ),
    );
  });
export const readStringFromFile = (path: string, encoding?: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    return yield* fs.readFileString(path, encoding).pipe(
      Effect.mapError((e) =>
        wrapInfraError(IOError, e, () => ({
          message: 'fail to read string from file',
          target: path,
          layer: 'filesystem' as const,
          operation: 'read' as const,
        })),
      ),
    );
  });
export const copyFile = (source: string, destination: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    return yield* fs.copyFile(source, destination).pipe(
      Effect.mapError((e) =>
        wrapInfraError(IOError, e, () => ({
          message: 'fail to copy file',
          target: `from ${source} to ${destination}`,
          layer: 'filesystem' as const,
          operation: 'transform' as const,
        })),
      ),
    );
  });
export const copyFolder = (
  source: string,
  destination: string,
  options?: {
    readonly overwrite?: boolean | undefined;
    readonly preserveTimestamps?: boolean | undefined;
  },
) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    return yield* fs.copy(source, destination, options).pipe(
      Effect.mapError((e) =>
        wrapInfraError(IOError, e, () => ({
          message: 'fail to copy folder',
          target: `from ${source} to ${destination}`,
          layer: 'filesystem' as const,
          operation: 'transform' as const,
        })),
      ),
    );
  });
export const getFileStat = (path: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    return yield* fs.stat(path).pipe(
      Effect.mapError((e) =>
        wrapInfraError(IOError, e, () => ({
          message: 'fail to check stat',
          target: path,
          layer: 'filesystem' as const,
          operation: 'read' as const,
        })),
      ),
    );
  });
export const pathExists = (path: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    return yield* fs.exists(path).pipe(
      Effect.mapError((e) =>
        wrapInfraError(IOError, e, () => ({
          message: 'fail to check existence',
          target: path,
          layer: 'filesystem' as const,
          operation: 'read' as const,
        })),
      ),
    );
  });
export const readDirectoryDetailed = (dir: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const names = yield* fs.readDirectory(dir).pipe(
      Effect.mapError((e) =>
        wrapInfraError(IOError, () => ({
          message: 'fail to read directory',
          target: dir,
          layer: 'filesystem' as const,
          operation: 'read' as const,
        })),
      ),
    );

    return yield* Effect.forEach(
      names,
      (name) =>
        Effect.gen(function* () {
          const path = `${dir}/${name}`;
          const stat = yield* fs.stat(path).pipe(
            Effect.mapError((e) =>
              wrapInfraError(IOError, () => ({
                message: 'fail to retrieve stat',
                target: path,
                layer: 'filesystem' as const,
                operation: 'read' as const,
              })),
            ),
          );

          return {
            name,
            path,
            type: stat.type,
            isFile: stat.type == 'File',
            isDirectory: stat.type == 'Directory',
          };
        }),
      { concurrency: 'unbounded' },
    );
  });
export const removePath = (
  path: string,
  options?: {
    readonly recursive?: boolean | undefined;
    readonly force?: boolean | undefined;
  },
) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    const exist = yield* fs.exists(path);
    if (exist) {
      yield* fs.remove(path, options);
    }
  }).pipe(
    Effect.mapError((e) =>
      wrapInfraError(IOError, e, () => ({
        message: 'fail to remove',
        target: path,
        layer: 'filesystem' as const,
        operation: 'transform' as const,
      })),
    ),
  );
export const emptyDir = (dir: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    const exist = yield* fs.exists(dir);
    if (exist) {
      yield* fs.remove(dir, { recursive: true });
    }

    // 再作成
    yield* fs.makeDirectory(dir, { recursive: true });
  }).pipe(
    Effect.mapError((e) =>
      wrapInfraError(IOError, e, () => ({
        message: 'fail to make directory empty',
        target: dir,
        layer: 'filesystem' as const,
        operation: 'write' as const,
      })),
    ),
  );
export const makeDirectory = (dir: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    yield* fs.makeDirectory(dir, { recursive: true }).pipe(
      Effect.mapError((e) =>
        wrapInfraError(IOError, e, () => ({
          message: 'fail to make directory',
          target: dir,
          layer: 'filesystem' as const,
          operation: 'write' as const,
        })),
      ),
    );
  });
export const ensureFile = (
  filePath: string,
): Effect.Effect<void, IOError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    // 親ディレクトリ作成
    yield* fs.makeDirectory(ps.dirname(filePath), {
      recursive: true,
    });

    // ファイル存在チェック
    const exists = yield* fs.exists(filePath);

    if (!exists) {
      // 空ファイル作成
      yield* fs.writeFile(filePath, new Uint8Array());
    }
  }).pipe(
    Effect.mapError((e) =>
      wrapInfraError(IOError, e, () => ({
        message: 'fail to ensure file',
        target: filePath,
        layer: 'filesystem' as const,
        operation: 'write' as const,
      })),
    ),
  );

export const ensureFileNotExist = (
  filePath: string,
): Effect.Effect<void, IOError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    // 親ディレクトリ作成
    yield* fs.makeDirectory(ps.dirname(filePath), {
      recursive: true,
    });

    // ファイル存在チェック
    const exists = yield* fs.exists(filePath);

    if (exists) {
      // 空ファイル作成
      yield* fs.remove(filePath);
    }
  }).pipe(
    Effect.mapError((e) =>
      wrapInfraError(IOError, e, () => ({
        message: 'fail to ensure file',
        target: filePath,
        layer: 'filesystem' as const,
        operation: 'write' as const,
      })),
    ),
  );
