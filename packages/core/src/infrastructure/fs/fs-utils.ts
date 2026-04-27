import { FileSystem, Path } from 'effect';
import { Stream, Effect } from 'effect';
import { IOError, unknownError } from '../../errors.js';
import { PlatformError } from 'effect/PlatformError';
import { AppError } from '../../base-error.js';
import ps from 'path';

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
export const writeStreamToFile =
  (
    path: string,
    options?: {
      readonly flag?: FileSystem.OpenFlag | undefined;
      readonly mode?: number | undefined;
    },
  ) =>
  <E extends AppError, R>(
    self: Stream.Stream<Uint8Array, E, R>,
  ): Effect.Effect<void, E | IOError, R | FileSystem.FileSystem> =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      console.log(`${path}`);
      //return yield* Stream.run(self, fs.sink(path, options));
      return yield* self
        .pipe(Stream.run(fs.sink(path, options)))
        .pipe(
          Effect.mapError((e) =>
            unknownError(IOError, e, `Fail to write strem into file ${path}`),
          ),
        );
    });

/**
 * 文字列ストリームを UTF-8 でエンコードしてファイルに書き出すオペレーター
 */
export const writeTextStreamToFile =
  (path: string) =>
  <E extends AppError, R>(
    self: Stream.Stream<string, E, R>,
  ): Effect.Effect<
    void,
    E | IOError | PlatformError,
    R | FileSystem.FileSystem
  > =>
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
    return yield* fs
      .open(path, options)
      .pipe(
        Effect.mapError((e) =>
          unknownError(IOError, e, `Fail to open File: ${path}`),
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
    return yield* fs
      .writeFile(path, data, options)
      .pipe(
        Effect.mapError((e) =>
          unknownError(IOError, e, `Fail to write File: ${path}`),
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
    return yield* fs
      .writeFileString(path, data, options)
      .pipe(
        Effect.mapError((e) =>
          unknownError(IOError, e, `Fail to write File: ${path}`),
        ),
      );
  });
export const readFromFile = (path: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    return yield* fs
      .readFile(path)
      .pipe(
        Effect.mapError((e) =>
          unknownError(IOError, e, `Fail to read from File: ${path}`),
        ),
      );
  });
export const readStringFromFile = (path: string, encoding?: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    return yield* fs
      .readFileString(path, encoding)
      .pipe(
        Effect.mapError((e) =>
          unknownError(IOError, e, `Fail to read string from File: ${path}`),
        ),
      );
  });
export const copyFile = (source: string, destination: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    return yield* fs
      .copyFile(source, destination)
      .pipe(
        Effect.mapError((e) =>
          unknownError(
            IOError,
            e,
            `Fail to copy file from ${source} to ${destination}`,
          ),
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
    return yield* fs
      .copy(source, destination, options)
      .pipe(
        Effect.mapError((e) =>
          unknownError(
            IOError,
            e,
            `Fail to copy folder from ${source} to ${destination}`,
          ),
        ),
      );
  });
export const getFileStat = (path: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    return yield* fs
      .stat(path)
      .pipe(
        Effect.mapError((e) =>
          unknownError(IOError, e, `Fail to check stat on ${path}`),
        ),
      );
  });
export const pathExists = (path: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    return yield* fs
      .exists(path)
      .pipe(
        Effect.mapError((e) =>
          unknownError(IOError, e, `Fail to check existence on ${path}`),
        ),
      );
  });
export const readDirectoryDetailed = (dir: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const names = yield* fs
      .readDirectory(dir)
      .pipe(
        Effect.mapError((e) =>
          unknownError(IOError, `Fail to read directory on ${dir}`),
        ),
      );

    return yield* Effect.forEach(
      names,
      (name) =>
        Effect.gen(function* () {
          const path = `${dir}/${name}`;
          const stat = yield* fs
            .stat(path)
            .pipe(
              Effect.mapError((e) =>
                unknownError(IOError, `Fail to retrieve stat on ${path}`),
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

export const emptyDir = (dir: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    const exist = yield* fs.exists(dir);
    if (exist) {
      yield* fs.remove(dir, { recursive: true });
    }

    // 再作成
    yield* fs.makeDirectory(dir, { recursive: true });
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
      unknownError(IOError, e, `Fail to ensure file :${filePath}`),
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
      unknownError(IOError, e, `Fail to ensure file :${filePath}`),
    ),
  );
