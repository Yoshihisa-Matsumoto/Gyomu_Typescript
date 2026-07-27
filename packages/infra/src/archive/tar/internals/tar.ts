import path from 'node:path'
import * as tar from 'tar-stream'
import { create } from 'tar'
import { Effect, Option, Queue, Stream } from 'effect'
import { NodeStream } from '@effect/platform-node'
import { IOError, wrapInfraError } from '@gyomu/schema'
import { runSync } from 'effect/Effect'
import { makeDirectory, writeStreamToFile } from '../../../fs/fs-utils.js'
import type { Readable } from 'node:stream'

import type { FileSystem } from 'effect'
import type { FileTransportInfo } from '@gyomu/schema/gyomu/file'
import type { ArchiveEntryItem } from '../../common.js'

type TarEntryItem = Extract<ArchiveEntryItem, { _tag: 'tar' }>

/**
 * Creates a tar (or tar.gz) archive from the contents of the specified directory.
 *
 * @param options Configuration options for archive creation.
 *
 * @returns An Effect that yields true upon successful archive creation, or fails with an IOError.
 */
export const createTar = <R = never>(options: {
  tarFileName: string
  cwd: string
  gzip?: boolean
}): Effect.Effect<boolean, IOError, R> =>
  Effect.tryPromise({
    try: () =>
      create(
        {
          file: options.tarFileName,
          cwd: options.cwd,
          gzip: options.gzip ?? false,
        },
        [''], // cwd 配下のすべてを対象とする
      ),
    catch: (err) =>
      wrapInfraError(IOError, err, () => ({
        message: 'Fail to Tar archive',
        layer: 'archive' as const,
        operation: 'write' as const,
      })),
  }).pipe(
    // 戻り値を boolean (true) に合わせる場合
    Effect.as(true),
  )

// type TarEntry = {
//   //readonly header: tar.Headers;
//   path: string;
//   isDirectory: boolean;
//   readonly stream: Stream.Stream<Uint8Array, AppError>;
// };

/**
 * Parses a tar archive stream into a stream of individual entries.
 *
 * @param source The input stream containing the tar archive data.
 *
 * @returns A stream of TarEntryItem objects.
 */
export const untar = <R = never>(
  source: Stream.Stream<Uint8Array, IOError, R>,
): Stream.Stream<TarEntryItem, IOError, R> =>
  Stream.scoped(
    Stream.unwrap(
      Effect.gen(function* () {
        const extract = tar.extract()

        // 1. Source を Extract に流し込む (Scoped Fiber)
        const nodeReadable = yield* NodeStream.toReadable(source)
        yield* Effect.promise(
          () =>
            new Promise<void>((resolve, reject) => {
              nodeReadable.pipe(extract)
              extract.on('finish', resolve)
              extract.on('error', reject)
            }),
        ).pipe(
          Effect.catch((e) => Effect.logError('Tar Pipeline Error', e)),
          Effect.forkScoped,
        )

        // 2. Stream.callback による実装
        // emit は Queue<Take<TarEntry, AppError>> のような挙動をする Queue です
        return Stream.callback<TarEntryItem, IOError, R>((queue) => {
          extract.on('entry', (header, stream, next) => {
            // next() を確実に呼ぶためのフラグ
            let nextCalled = false
            const safeNext = () => {
              if (!nextCalled) {
                nextCalled = true
                next()
              }
            }
            // Stream.acquireRelease の代わり: Stream.scoped + Effect.acquireRelease
            const content = Stream.unwrap(
              Effect.acquireRelease(Effect.succeed(stream as Readable), () =>
                Effect.sync(() => safeNext()),
              ).pipe(
                Effect.map((s) =>
                  NodeStream.fromReadable<Uint8Array, IOError>({
                    evaluate: () => s,
                    onError: (e) =>
                      wrapInfraError(IOError, e, () => ({
                        message: `Read error on header`,
                        target: header.name,
                        layer: 'archive' as const,
                        operation: 'read' as const,
                      })),
                  }),
                ),
              ),
            )

            // @effect-diagnostics-next-line floatingEffect:off
            content.pipe(Stream.ensuring(Effect.sync(() => safeNext())))

            // Queue.offer を使ってデータを流す (single の代わり)
            // Stream.callback の emit は Effect を返す関数ではなく直接 Queue.offer 的な挙動
            const entry: TarEntryItem =
              header.type == 'file'
                ? {
                    _tag: 'tar',
                    path: header.name,
                    isDirectory: false,
                    openStream: () => content,
                    uncompressedSize: header.size!,
                  }
                : {
                    _tag: 'tar',
                    path: header.name,
                    isDirectory: true,
                    openStream: () => content,
                  }
            runSync(Queue.offer(queue, entry))
          })

          extract.on('finish', () => {
            runSync(Queue.end(queue)) // エンド信号 (None/undefined で終了)
          })

          extract.on('error', (err) => {
            runSync(
              Queue.fail(
                queue,
                wrapInfraError(IOError, err, () => ({
                  message: 'Tar error',
                  layer: 'archive' as const,
                  operation: 'read' as const,
                })),
              ),
            )
          })
          return Effect.void
        })
      }),
    ),
  )

/**
 * Checks if a specific file exists within a tar archive stream.
 *
 * @param entryName The file path to look for.
 *
 * @param self The tar archive stream.
 *
 * @returns An Effect that returns true if the entry is found, false otherwise.
 */
export const existsInTar =
  (entryName: string) =>
  <R = never>(self: Stream.Stream<Uint8Array, IOError, R>): Effect.Effect<boolean, IOError, R> =>
    self.pipe(
      untar,
      filterEntries((h) => h.path === massageEntryPath(entryName)),
      Stream.runHead,
      Effect.flatMap((option) =>
        Option.match(option, {
          // 見つからなかった場合
          onNone: () => Effect.succeed(false),
          // 見つかった場合、そのエントリの content を空読みしてストリームを正常終了させる
          onSome: (entry) => Stream.runDrain(entry.openStream()).pipe(Effect.as(true)),
        }),
      ),
    )

/**
 * Reads the entire content of a TarEntryItem and returns it as a string.
 *
 * @param entry The tar entry to read.
 *
 * @returns An Effect that yields the string content of the entry, or fails with an IOError.
 */
export const readTextEntry = <R = never>(entry: TarEntryItem): Effect.Effect<string, IOError, R> =>
  readEntry(entry).pipe(Effect.map((chunks) => Buffer.concat(chunks).toString('utf8')))

/**
 * Reads all content chunks of a tar entry into an array.
 *
 * @param entry The tar entry to collect.
 *
 * @returns An Effect containing an array of binary data chunks.
 */
export const readEntry = <R = never>(
  entry: TarEntryItem,
): Effect.Effect<Array<Uint8Array<ArrayBufferLike>>, IOError, R> =>
  Stream.runCollect(entry.openStream())

/**
 * Returns a stream representing the content of a specific tar entry.
 *
 * @param entry The tar entry.
 *
 * @returns A Stream of binary data chunks.
 */
export const readEntryStream = <R = never>(
  entry: TarEntryItem,
): Stream.Stream<Uint8Array<ArrayBufferLike>, IOError, R> => entry.openStream()

const massageEntryPath = (fileName: string) => {
  return fileName ? fileName.replace(/\\/g, '/') : fileName
}

/**
 * Filters tar entries using the provided predicate and automatically drains skipped entries to prevent deadlocks.
 *
 * @param predicate Condition to select entries.
 *
 * @returns A filtered stream of tar entries.
 */
export const filterEntries =
  <R = never>(predicate: (entry: TarEntryItem) => boolean) =>
  (self: Stream.Stream<TarEntryItem, IOError, R>): Stream.Stream<TarEntryItem, IOError, R> =>
    self.pipe(
      Stream.mapEffect((entry) =>
        predicate(entry)
          ? Effect.succeed(Option.some(entry))
          : Stream.runDrain(entry.openStream()).pipe(Effect.as(Option.none())),
      ),
      Stream.flatMap((opt) =>
        Option.match(opt, {
          onNone: () => Stream.empty,
          onSome: (v) => Stream.make(v),
        }),
      ),
    )

/**
 * Retrieves a single specific tar entry, failing with an IOError if the entry is not found.
 *
 * @param entryName The path or name of the entry to find.
 *
 * @returns An Effect yielding the found entry, or failing if not present.
 */
export const requireEntry =
  (entryName: string) =>
  <R = never>(self: Stream.Stream<TarEntryItem, IOError, R>) =>
    self.pipe(
      // 1. フィルタリング（内部で Drain 済み）
      filterEntries((h) => h.path === massageEntryPath(entryName)),
      // 2. 最初の 1 つを取る
      Stream.runHead,
      // 3. Option を剥がして、None なら Fail させる
      Effect.flatMap(
        Option.match({
          onNone: () =>
            Effect.fail(
              new IOError({
                message: `File not found: ${entryName}`,
                target: entryName,
                layer: 'archive' as const,
                operation: 'read' as const,
                cause: undefined,
              }),
            ),
          onSome: (entry) => Effect.succeed(entry),
        }),
      ),
    )

/**
 * Extracts the entire tar stream into the specified target directory.
 *
 * @param destinationDirectory The directory where contents should be extracted.
 *
 * @param self The input tar stream.
 *
 * @returns An Effect completing when extraction is finished.
 */
export const extractTarAll =
  (destinationDirectory: string) =>
  <R = never>(
    self: Stream.Stream<Uint8Array<ArrayBufferLike>, IOError, R>,
  ): Effect.Effect<void, IOError, FileSystem.FileSystem | R> =>
    extractTarToDirectory({ targetDir: destinationDirectory })(self)

/**
 * Extracts the contents of a tar stream into the specified target directory.
 *
 * @param options Configuration including the target directory and optional path stripping.
 *
 * @returns An Effect that completes when extraction finishes, or fails with an IOError.
 */
export const extractTarToDirectory =
  (options: { targetDir: string; stripPath?: string }) =>
  <R = never>(
    self: Stream.Stream<Uint8Array<ArrayBufferLike>, IOError, R>,
  ): Effect.Effect<void, IOError, FileSystem.FileSystem | R> =>
    Effect.gen(function* () {
      const { targetDir, stripPath = '' } = options

      return yield* self.pipe(
        untar,
        // 1. stripPath でフィルタリング
        filterEntries((entry) => entry.path.startsWith(massageEntryPath(stripPath))),
        // 2. 各エントリをファイルとして書き出す
        Stream.runForEach((entry) =>
          Effect.gen(function* () {
            // 相対パスの計算 (stripPath 分を削る)
            const relativePath = stripPath
              ? entry.path.slice(stripPath.length).replace(/^[/\\]+/, '')
              : entry.path

            if (!relativePath) return yield* Stream.runDrain(entry.openStream()) // プレフィックス自体はスキップ

            const fullPath = path.join(targetDir, relativePath)

            // ディレクトリの場合は作成して終了
            if (entry.isDirectory) {
              yield* makeDirectory(fullPath)
              return yield* Stream.runDrain(entry.openStream()).pipe(
                Effect.mapError((e) =>
                  wrapInfraError(IOError, e, () => ({
                    message: 'fail to save file',
                    operation: 'write' as const,
                    layer: 'archive' as const,
                    target: fullPath,
                  })),
                ),
              )
            }

            // ファイルの場合は親ディレクトリを作ってから書き込み
            yield* makeDirectory(path.dirname(fullPath))
            yield* Effect.logDebug(`Untar ${fullPath}`)
            // entry.content (Stream) をファイルに流し込む
            // sinkUnique などを使って効率的に書き込む
            return yield* writeStreamToFile(fullPath)(entry.openStream())
          }),
        ),
        Effect.mapError((e) =>
          wrapInfraError(IOError, e, () => ({
            message: 'fail to save file',
            layer: 'archive' as const,
            operation: 'write' as const,
            target: targetDir,
          })),
        ),
      )
    })

/**
 * Extracts a single file from a tar stream to a specific destination.
 *
 * @param sourceEntryFullName The full path of the file to extract from the tar.
 *
 * @param destinationFolderName The target directory for the file.
 *
 * @returns An Effect completing upon successful file extraction.
 */
export const extractTarSingleFile =
  (sourceEntryFullName: string, destinationFolderName: string) =>
  <R = never>(
    self: Stream.Stream<Uint8Array<ArrayBufferLike>, IOError, R>,
  ): Effect.Effect<void, IOError, FileSystem.FileSystem | R> =>
    Effect.gen(function* () {
      const entry = yield* self.pipe(
        untar,
        // 1. stripPath でフィルタリング
        requireEntry(sourceEntryFullName),
      )
      if (entry.isDirectory) {
        return yield* Effect.fail(
          new IOError({
            message: `${sourceEntryFullName} is a directory`,
            cause: undefined,
            layer: 'archive' as const,
            operation: 'read' as const,
            target: entry.path,
          }),
        )
      }
      // 相対パスの計算 (stripPath 分を削る)
      const fileName = path.basename(sourceEntryFullName)

      const fullPath = path.join(destinationFolderName, fileName)

      // ファイルの場合は親ディレクトリを作ってから書き込み
      yield* makeDirectory(path.dirname(fullPath))
      yield* Effect.logDebug(`Untar ${fullPath}`)
      // entry.stream (Stream) をファイルに流し込む
      // sinkUnique などを使って効率的に書き込む
      return yield* writeStreamToFile(fullPath)(entry.openStream())
    })

/**
 * Dispatches extraction based on provided file transport information.
 *
 * @param transferInformation Metadata about source and destination files.
 *
 * @param self Input stream to extract.
 *
 * @returns An Effect performing the specific extraction task.
 */
export const extractTar =
  <R = never>(transferInformation: FileTransportInfo) =>
  (
    self: Stream.Stream<Uint8Array<ArrayBufferLike>, IOError, R>,
  ): Effect.Effect<void, IOError, FileSystem.FileSystem | R> =>
    Effect.gen(function* () {
      if (transferInformation.sourceFileName !== transferInformation.destinationFileName)
        return yield* Effect.fail(
          new IOError({
            message: 'Destination filename must be same as original filename',
            cause: undefined,
            layer: 'archive' as const,
            operation: 'read' as const,
            target: `source:${transferInformation.sourceFileName}, destination:${transferInformation.destinationFileName}`,
          }),
        )
      if (!transferInformation.isSourceDirectory) {
        return yield* extractTarSingleFile(
          transferInformation.sourceFullName,
          transferInformation.destinationPath,
        )(self)
      } else {
        return yield* extractTarToDirectory({
          targetDir: transferInformation.destinationFullName,
          stripPath: transferInformation.sourceFullName,
        })(self)
      }
    })
