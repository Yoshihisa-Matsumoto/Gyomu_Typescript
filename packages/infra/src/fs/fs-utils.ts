import { dirname, extname, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { tmpdir } from 'node:os'
import { Effect, FileSystem, Stream } from 'effect'
import { FullPath, IOError, wrapIOError } from '@gyomu/schema'
import { parse } from 'yaml'
import { convertToSchemaObjectWithEffect } from '@gyomu/schema/entity'
import { fromSync } from '@gyomu/schema/effect'
import type { NetworkError, SchemaValidationError } from '@gyomu/schema'
import type { EntryInfo } from './types.js'
import type { Schema } from 'effect'
import type { PlatformError } from 'effect/PlatformError'

/**
 * Creates a file stream from the specified path. Resolves the FileSystem service and wraps errors in an IOError.
 *
 * @param path The file path to stream from.
 *
 * @returns An Effect containing a Stream of Uint8Array data.
 */
export const fileStream = (
  path: string,
): Stream.Stream<Uint8Array, IOError, FileSystem.FileSystem> =>
  Stream.unwrap(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      return fs.stream(path).pipe(Stream.mapError((err) => wrapIOError(err)))
    }),
  )
// export const fileStream = (path: string) =>
//   NodeStream.fromReadable<Uint8Array, AppError>({
//     evaluate: () => fs.createReadStream(path),
//     onError: (e) => unknownError(IOError, e, 'file read error'),
//   });

/**
 * A generic operator that writes a stream to a file.
 *
 * @param path The destination file path.
 *
 * @param options Optional file writing flags and mode.
 *
 * @returns An Effect that completes when writing is finished.
 */
export const writeStreamToFile =
  (
    path: string,
    options?: {
      readonly flag?: FileSystem.OpenFlag | undefined
      readonly mode?: number | undefined
    },
  ) =>
  <R>(
    self: Stream.Stream<Uint8Array, IOError | NetworkError, R>,
  ): Effect.Effect<void, IOError, R | FileSystem.FileSystem> =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      console.log(`${path}`)
      // return yield* Stream.run(self, fs.sink(path, options));
      return yield* self.pipe(Stream.run(fs.sink(path, options))).pipe(
        Effect.mapError((e) =>
          wrapIOError(e, () => ({
            message: 'fail to write stream into file',
            target: path,
            operation: 'write' as const,
            layer: 'filesystem' as const,
          })),
        ),
      )
    })

/**
 * An operator that encodes a string stream to UTF-8 and writes it to a file.
 *
 * @param path The destination file path.
 *
 * @returns An Effect that completes when writing the encoded stream is finished.
 */
export const writeTextStreamToFile =
  (path: string) =>
  <R>(
    self: Stream.Stream<string, IOError, R>,
  ): Effect.Effect<void, IOError | PlatformError, R | FileSystem.FileSystem> =>
    self.pipe(
      Stream.encodeText, // 内部で TextEncoder を使用 (UTF-8)
      writeStreamToFile(path),
    )

/**
 * Opens a file using the FileSystem service and wraps errors in an IOError.
 *
 * @param path The path to the file to open.
 *
 * @param options Optional configuration for opening the file, including flags and mode.
 *
 * @returns An Effect containing the opened file handle.
 */
export const openFile = (
  path: string,
  options?: {
    readonly flag?: FileSystem.OpenFlag | undefined
    readonly mode?: number | undefined
  },
) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    return yield* fs.open(path, options).pipe(
      Effect.mapError((e) =>
        wrapIOError(e, () => ({
          message: 'fail to open file',
          target: path,
          layer: 'filesystem' as const,
          operation: 'open' as const,
        })),
      ),
    )
  })

/**
 * Writes data to a file, ensuring the parent directory exists, and wraps errors in an IOError.
 *
 * @param path The destination file path.
 *
 * @param data The binary data to write.
 *
 * @param options Optional file system write configuration.
 *
 * @returns An Effect that completes when writing is successful.
 */
export const writeToFile = (
  path: string,
  data: Uint8Array<ArrayBufferLike>,
  options?: {
    readonly flag?: FileSystem.OpenFlag | undefined
    readonly mode?: number | undefined
  },
) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const dir = dirname(path)

    yield* fs
      .makeDirectory(dir, {
        recursive: true,
      })
      .pipe(
        Effect.mapError((e) =>
          wrapIOError(e, () => ({
            message: 'fail to create directory',
            target: path,
            layer: 'filesystem' as const,
            operation: 'write' as const,
          })),
        ),
      )
    return yield* fs.writeFile(path, data, options).pipe(
      Effect.mapError((e) =>
        wrapIOError(e, () => ({
          message: 'fail to write file',
          target: path,
          layer: 'filesystem' as const,
          operation: 'write' as const,
        })),
      ),
    )
  })

/**
 * Writes a string to a file, ensuring the parent directory exists, and wraps errors in an IOError.
 *
 * @param path The destination file path.
 *
 * @param data The string content to write.
 *
 * @param options Optional file system write configuration.
 *
 * @returns An Effect that completes when writing is successful.
 */
export const writeStringToFile = (
  path: string,
  data: string,
  options?: {
    readonly flag?: FileSystem.OpenFlag | undefined
    readonly mode?: number | undefined
  },
) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const dir = dirname(path)

    yield* fs
      .makeDirectory(dir, {
        recursive: true,
      })
      .pipe(
        Effect.mapError((e) =>
          wrapIOError(e, () => ({
            message: 'fail to create directory',
            target: path,
            layer: 'filesystem' as const,
            operation: 'write' as const,
          })),
        ),
      )
    return yield* fs.writeFileString(path, data, options).pipe(
      Effect.mapError((e) =>
        wrapIOError(e, () => ({
          message: 'fail to write file',
          target: path,
          layer: 'filesystem' as const,
          operation: 'write' as const,
        })),
      ),
    )
  })

/**
 * Reads data from a file and wraps errors in an IOError.
 *
 * @param path The path of the file to read.
 *
 * @returns An Effect yielding the file content.
 */
export const readFromFile = (path: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    return yield* fs.readFile(path).pipe(
      Effect.mapError((e) =>
        wrapIOError(e, () => ({
          message: 'fail to read from file',
          target: path,
          layer: 'filesystem' as const,
          operation: 'read' as const,
        })),
      ),
    )
  })

/**
 * Reads string content from a file and wraps errors in an IOError.
 *
 * @param path The path of the file to read.
 *
 * @param encoding Optional file encoding.
 *
 * @returns An Effect yielding the file content as a string.
 */
export const readStringFromFile = (path: string, encoding?: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    return yield* fs.readFileString(path, encoding).pipe(
      Effect.mapError((e) =>
        wrapIOError(e, () => ({
          message: 'fail to read string from file',
          target: path,
          layer: 'filesystem' as const,
          operation: 'read' as const,
        })),
      ),
    )
  })

/**
 * Reads a JSON file, parses the content, and wraps errors in an IOError.
 *
 * @param path The path of the JSON file.
 *
 * @param encoding Optional file encoding.
 *
 * @returns An Effect yielding the parsed JSON object.
 */
export const readJsonFromFile = <T>(path: string, encoding?: string) =>
  Effect.gen(function* () {
    const text = yield* readStringFromFile(path, encoding)
    return yield* fromSync(IOError, (e) => ({
      layer: 'filesystem' as const,
      message: 'fail to parse JSON',
      operation: 'transform' as const,
    }))(() => JSON.parse(text) as T)
  })

/**
 * Reads, parses, and validates a JSON file against the provided schema.
 *
 * @param schemaName A identifier for the schema used in error messages.
 *
 * @param schema The Effect Schema used for validation.
 *
 * @param path The file path to the JSON.
 *
 * @param encoding Optional file encoding.
 *
 * @returns An Effect yielding the validated object based on the provided schema.
 */
export const readJsonFromFileAndValidate = <S extends Schema.Top>(
  schemaName: string,
  schema: S,
  path: string,
  encoding?: string,
): Effect.Effect<Schema.Schema.Type<S>, IOError | SchemaValidationError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const jsonData = yield* readJsonFromFile(path, encoding)
    return yield* convertToSchemaObjectWithEffect(schemaName)(schema, jsonData)
  })

/**
 * Reads a YAML file and parses the content.
 *
 * @param path The path of the YAML file.
 *
 * @param encoding Optional file encoding.
 *
 * @returns An Effect yielding the parsed YAML object.
 */
export const readYamlFromFile = <T>(path: string, encoding?: string) =>
  Effect.gen(function* () {
    const text = yield* readStringFromFile(path, encoding)
    return parse(text) as T
  })

/**
 * Reads, parses, and validates a YAML file against the provided schema.
 *
 * @param schemaName A identifier for the schema used in error messages.
 *
 * @param schema The Effect Schema used for validation.
 *
 * @param path The file path to the YAML.
 *
 * @param encoding Optional file encoding.
 *
 * @returns An Effect yielding the validated object based on the provided schema.
 */
export const readYamlFromFileAndValidate = <S extends Schema.Top>(
  schemaName: string,
  schema: S,
  path: string,
  encoding?: string,
): Effect.Effect<Schema.Schema.Type<S>, IOError | SchemaValidationError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const yamlData = yield* readYamlFromFile(path, encoding)
    return yield* convertToSchemaObjectWithEffect(schemaName)(schema, yamlData)
  })

/**
 * Copies a file from the source path to the destination path.
 *
 * @param source The source file path.
 *
 * @param destination The destination file path.
 *
 * @returns An Effect that completes when copying is successful.
 */
export const copyFile = (source: string, destination: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    return yield* fs.copyFile(source, destination).pipe(
      Effect.mapError((e) =>
        wrapIOError(e, () => ({
          message: 'fail to copy file',
          target: `from ${source} to ${destination}`,
          layer: 'filesystem' as const,
          operation: 'transform' as const,
        })),
      ),
    )
  })

/**
 * Copies a directory from the source to the destination path.
 *
 * @param source The source directory path.
 *
 * @param destination The destination directory path.
 *
 * @param options Optional copy behavior settings.
 *
 * @returns An Effect that completes when copying is successful.
 */
export const copyFolder = (
  source: string,
  destination: string,
  options?: {
    readonly overwrite?: boolean | undefined
    readonly preserveTimestamps?: boolean | undefined
  },
) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    return yield* fs.copy(source, destination, options).pipe(
      Effect.mapError((e) =>
        wrapIOError(e, () => ({
          message: 'fail to copy folder',
          target: `from ${source} to ${destination}`,
          layer: 'filesystem' as const,
          operation: 'transform' as const,
        })),
      ),
    )
  })

/**
 * Retrieves file metadata stats for a given path.
 *
 * @param path The path to check stats for.
 *
 * @returns An Effect yielding the file stat object.
 */
export const getFileStat = (path: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    return yield* fs.stat(path).pipe(
      Effect.mapError((e) =>
        wrapIOError(e, () => ({
          message: 'fail to check stat',
          target: path,
          layer: 'filesystem' as const,
          operation: 'read' as const,
        })),
      ),
    )
  })

/**
 * Checks if a path exists in the file system.
 *
 * @param path The path to check.
 *
 * @returns An Effect yielding a boolean indicating existence.
 */
export const pathExists = (path: FullPath) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    return yield* fs.exists(path).pipe(
      Effect.mapError((e) =>
        wrapIOError(e, () => ({
          message: 'fail to check existence',
          target: path,
          layer: 'filesystem' as const,
          operation: 'read' as const,
        })),
      ),
    )
  })

/**
 * Reads a directory and returns detailed information for each entry.
 *
 * @param dir The directory path to read.
 *
 * @returns An Effect yielding an array of entry information details.
 */
export const readDirectoryDetailed = (dir: FullPath) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const names = yield* fs.readDirectory(dir).pipe(
      Effect.mapError(() =>
        wrapIOError(() => ({
          message: 'fail to read directory',
          target: dir,
          layer: 'filesystem' as const,
          operation: 'read' as const,
        })),
      ),
    )

    return yield* Effect.forEach(
      names,
      (name) =>
        Effect.gen(function* () {
          const path = FullPath(`${dir}/${name}`)
          const stat = yield* fs.stat(path).pipe(
            Effect.mapError(() =>
              wrapIOError(() => ({
                message: 'fail to retrieve stat',
                target: path,
                layer: 'filesystem' as const,
                operation: 'read' as const,
              })),
            ),
          )

          return {
            name,
            path,
            type: stat.type,
            isFile: stat.type == 'File',
            isDirectory: stat.type == 'Directory',
          } satisfies EntryInfo
        }),
      { concurrency: 'unbounded' },
    )
  })

/**
 * Expands a basic directory glob pattern into a list of existing directory paths.
 *
 * @param repositoryRoot The root path of the repository.
 *
 * @param pattern The glob pattern to expand.
 *
 * @returns An Effect yielding an array of matching directory paths.
 */
export const expandDirectoryGlob = (repositoryRoot: string, pattern: string) =>
  Effect.gen(function* () {
    if (!pattern.endsWith('/*')) {
      return []
    }
    if (pattern.startsWith('!')) {
      return []
    }
    const fs = yield* FileSystem.FileSystem
    const parentDir = pattern.slice(0, -2)

    const targetDir = join(repositoryRoot, parentDir)

    const entries = yield* fs.readDirectory(targetDir)

    const results = yield* Effect.forEach(
      entries,
      (entry) =>
        Effect.gen(function* () {
          const fullPath = join(targetDir, entry)

          const directory = (yield* fs.stat(fullPath)).type == 'Directory'

          return directory ? join(parentDir, entry) : undefined
        }),
      {
        concurrency: 'unbounded',
      },
    )

    return results.filter((x): x is string => x !== undefined)
  }).pipe(
    Effect.mapError((e) =>
      wrapIOError(e, () => ({
        layer: 'filesystem' as const,
        message: 'fail to expand directory',
        target: repositoryRoot,
        details: pattern,
      })),
    ),
  )

/**
 * Removes a file or directory at the specified path.
 *
 * @param path The path to remove.
 *
 * @param options Optional removal settings, such as recursive or force.
 *
 * @returns An Effect that completes when removal is done.
 */
export const removePath = (
  path: string,
  options?: {
    readonly recursive?: boolean | undefined
    readonly force?: boolean | undefined
  },
) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem

    const exist = yield* fs.exists(path)
    if (exist) {
      yield* fs.remove(path, options)
    }
  }).pipe(
    Effect.mapError((e) =>
      wrapIOError(e, () => ({
        message: 'fail to remove',
        target: path,
        layer: 'filesystem' as const,
        operation: 'transform' as const,
      })),
    ),
  )

/**
 * Clears the contents of a directory, recreating it if necessary.
 *
 * @param dir The directory path to empty.
 *
 * @returns An Effect that completes when the directory is empty.
 */
export const emptyDir = (dir: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem

    const exist = yield* fs.exists(dir)
    if (exist) {
      yield* fs.remove(dir, { recursive: true })
    }

    // 再作成
    yield* fs.makeDirectory(dir, { recursive: true })
  }).pipe(
    Effect.mapError((e) =>
      wrapIOError(e, () => ({
        message: 'fail to make directory empty',
        target: dir,
        layer: 'filesystem' as const,
        operation: 'write' as const,
      })),
    ),
  )

/**
 * Ensures that a directory exists, optionally resolving the parent directory if fromFile is true.
 *
 * @param dir The directory path to create.
 *
 * @param fromFile If true, treats the path as a file and creates its parent directory.
 *
 * @returns An Effect that completes when directory creation is successful.
 */
export const makeDirectory = (dir: string, fromFile: boolean = false) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem

    let targetPath = dir
    if (fromFile) targetPath = dirname(dir)
    yield* fs.makeDirectory(targetPath, { recursive: true }).pipe(
      Effect.mapError((e) =>
        wrapIOError(e, () => ({
          message: 'fail to make directory',
          target: targetPath,
          layer: 'filesystem' as const,
          operation: 'write' as const,
        })),
      ),
    )
  })

/**
 * Ensures that a file exists at the given path, creating it and parent directories if necessary.
 *
 * @param filePath The path of the file to ensure.
 *
 * @returns An Effect indicating completion, or an IOError if the operation fails.
 */
export const ensureFile = (filePath: string): Effect.Effect<void, IOError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem

    // 親ディレクトリ作成
    yield* fs.makeDirectory(dirname(filePath), {
      recursive: true,
    })

    // ファイル存在チェック
    const exists = yield* fs.exists(filePath)

    if (!exists) {
      // 空ファイル作成
      yield* fs.writeFile(filePath, new Uint8Array())
    }
  }).pipe(
    Effect.mapError((e) =>
      wrapIOError(e, () => ({
        message: 'fail to ensure file',
        target: filePath,
        layer: 'filesystem' as const,
        operation: 'write' as const,
      })),
    ),
  )

/**
 * Ensures that no file exists at the given path, removing it if necessary.
 *
 * @param filePath The path to ensure is empty.
 *
 * @returns An Effect indicating completion, or an IOError if the removal fails.
 */
export const ensureFileNotExist = (
  filePath: string,
): Effect.Effect<void, IOError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem

    // 親ディレクトリ作成
    yield* fs.makeDirectory(dirname(filePath), {
      recursive: true,
    })

    // ファイル存在チェック
    const exists = yield* fs.exists(filePath)

    if (exists) {
      // 空ファイル作成
      yield* fs.remove(filePath)
    }
  }).pipe(
    Effect.mapError((e) =>
      wrapIOError(e, () => ({
        message: 'fail to ensure file',
        target: filePath,
        layer: 'filesystem' as const,
        operation: 'write' as const,
      })),
    ),
  )

/**
 * Extracts the file extension from a filename, excluding the leading dot.
 *
 * @param fileName The filename to process.
 *
 * @returns The file extension as a string, or an empty string if none exists.
 */
export const getFileExtension = (fileName: string) => {
  const extName = extname(fileName)
  if (extName.length > 0) {
    return extName.substring(1)
  }
  return extName
}

/**
 * Generates a unique temporary filename in the system's temporary directory.
 *
 * @returns A unique absolute file path string.
 */
export const getTempFilename = () => {
  const tmpFile = join(tmpdir(), randomUUID())
  return tmpFile
}
