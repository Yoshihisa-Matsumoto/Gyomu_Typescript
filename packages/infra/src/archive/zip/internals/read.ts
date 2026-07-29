import path from 'node:path'
import { Effect, Queue, Stream } from 'effect'
import yauzl from 'yauzl'
import { IOError, logger, wrapInfraError } from '@gyomu/schema'
import { decode } from '@gyomu/schema/shared/encoding'
import { runSync } from 'effect/Effect'
import { FileTransportInfo } from '@gyomu/schema/gyomu/file'
import { massageEntryPath } from '../../common.js'
import {
  fromNodeCallback,
  // fromReadable,
  fromReadableControlled,
} from '../../../stream/bridge/nodeStream.js'
import { makeDirectory, writeStreamToFile } from '../../../fs/fs-utils.js'
import type { ArchiveEntryItem } from '../../common.js'
import type { RandomAccessReader } from 'yauzl'
import type { FileSystem } from 'effect'

/**
 * Represents an entry item within a zip archive.
 */
export type ZipEntryItem = Extract<ArchiveEntryItem, { _tag: 'zip' }>

/**
 * Represents a file entry item within a zip archive (excluding directories).
 */
export type ZipFileEntryItem = Extract<ZipEntryItem, { isDirectory: false }>
const unicode_flag = 0x800

// type ZipCentralDirectory = {
//   zipFile: yauzl.ZipFile;
//   entries: Map<string, ZipEntryItem>;
// };

type ZipSource =
  | { type: 'file'; path: string }
  | { type: 'buffer'; buffer: Buffer }
  | { type: 'reader'; reader: RandomAccessReader; size: number }

const openZip = (source: ZipSource) =>
  fromNodeCallback<yauzl.ZipFile>((cb) => {
    switch (source.type) {
      case 'file':
        yauzl.open(source.path, { lazyEntries: true, decodeStrings: false }, cb)
        break
      case 'buffer':
        yauzl.fromBuffer(source.buffer, { lazyEntries: true, decodeStrings: false }, cb)
        break
      case 'reader':
        yauzl.fromRandomAccessReader(
          source.reader,
          source.size,
          { lazyEntries: true, decodeStrings: false },
          cb,
        )
        break
    }
  })

/**
 * Opens a zip file and automatically closes it after execution.
 *
 * @param filePath The file path of the zip archive.
 *
 * @returns An effect that manages the zip file lifecycle.
 */
export const withZipFile = (filePath: string) =>
  Effect.acquireRelease(openZip({ type: 'file', path: filePath }), (zip) =>
    Effect.sync(() => zip.close()),
  )

/**
 * Builds a stream of zip entries from a Yauzl ZipFile.
 *
 * @param zip The zip file instance.
 *
 * @param encoding Optional character encoding.
 *
 * @returns A stream of zip entries.
 */
export const buildCentralDirectory = <R = never>(
  zip: yauzl.ZipFile,
  encoding?: string,
): Stream.Stream<ZipEntryItem, IOError, R> =>
  Stream.callback<ZipEntryItem, IOError>((queue) =>
    // const entries = new Map<string, ZipEntryItem>();
    Effect.sync(() => {
      zip.readEntry()

      zip.on('entry', (entry) => {
        const rawFileNameBuffer = entry.fileName as Buffer

        const flags = entry.generalPurposeBitFlag
        const isUnicode = (flags & unicode_flag) !== 0
        const fileName = isUnicode
          ? rawFileNameBuffer.toString('utf-8')
          : decode(rawFileNameBuffer, encoding)

        logger.debug(fileName)
        if (/\/$/.test(fileName)) {
          logger.debug('directory')
          runSync(
            Queue.offer(queue, {
              _tag: 'zip',
              path: fileName,
              isDirectory: true,
            }),
          )
          zip.readEntry()
          // entries.set(fileName, {
          //   path: fileName,
          //   isDirectory: true,
          //   openStream: () => Stream.empty,
          // });
        } else {
          logger.debug('file')
          zip.openReadStream(entry, (err, rs) => {
            /**
             * fromReadableではうまくいかない。Node.js固有
             * もしかすると、Nodejs FileSystem固有のメソッドを作ったfromReadableを作ってそっちに変えたほうがいいかもしれない
             */
            const stream = fromReadableControlled(rs)
            runSync(
              Queue.offer(queue, {
                _tag: 'zip',
                path: fileName,
                crc32: entry.crc32,
                uncompressedSize: entry.uncompressedSize,
                isDirectory: false,
                openStream: () => stream,
              }),
            )
            zip.readEntry()
          })
        }
      })

      zip.on('end', () => {
        runSync(Queue.end(queue)) // エンド信号 (None/undefined で終了)
      })

      zip.on('error', (err) => {
        runSync(
          Queue.fail(
            queue,
            wrapInfraError(IOError, err, () => ({
              message: 'ZIp build central directory Error',
              layer: 'archive' as const,
              operation: 'read' as const,
            })),
          ),
        )
      })
    }),
  )

/**
 * Opens the entries of a zip file as a stream.
 *
 * @param filePath The path to the zip file.
 *
 * @param encoding Optional character encoding.
 *
 * @returns A stream of zip entry items.
 */
export const openZipEntries = (
  filePath: string,
  encoding?: string,
): Stream.Stream<ZipEntryItem, IOError, FileSystem.FileSystem> =>
  Stream.unwrap(Effect.map(withZipFile(filePath), (zip) => buildCentralDirectory(zip, encoding)))

/**
 * Checks if a specific file exists within the list of zip entries.
 *
 * @param entryName The name of the entry to search for.
 *
 * @returns An effect that resolves to true if the file exists, otherwise false.
 */
export const existsInZip =
  (entryName: string) =>
  <R = never>(entries: Array<ZipEntryItem>): Effect.Effect<boolean, never, R> => {
    const massagedPath = massageEntryPath(entryName)
    logger.debug(`massage:${massagedPath}`)
    const entry = entries.find((e) => e.path == massagedPath)
    logger.debug(entries.map((e) => e.path).join(','))
    if (!entry || entry.isDirectory) {
      return Effect.succeed(false)
    }

    return Effect.succeed(true)
  }

/**
 * ZipEntry の content をすべて読み込み、文字列として返す Effect を生成する
 *
 * @param entry The ZIP file entry to read.
 *
 * @param encoding The character encoding (defaults to 'utf-8').
 *
 * @returns An Effect that yields the file contents as a string, failing with an IOError if an error occurs.
 */
export const readTextEntry = <R = never>(
  entry: ZipFileEntryItem,
  encoding: string = 'utf-8',
): Effect.Effect<string, IOError, R> =>
  readEntry(entry).pipe(Effect.map((chunks) => decode(Buffer.concat(chunks), encoding)))

/**
 * Reads the entire content of a zip file entry as an array of byte buffers.
 *
 * @param entry The zip entry to read.
 *
 * @returns An effect that results in an array of byte chunks.
 */
export const readEntry = <R = never>(
  entry: ZipFileEntryItem,
): Effect.Effect<Array<Uint8Array<ArrayBufferLike>>, IOError, R> =>
  Stream.runCollect(entry.openStream())

/**
 * Provides a stream for reading the content of a zip file entry.
 *
 * @param entry The zip entry to read.
 *
 * @returns A stream of byte chunks from the entry.
 */
export const readEntryStream = <R = never>(
  entry: ZipFileEntryItem,
): Stream.Stream<Uint8Array<ArrayBufferLike>, IOError, R> => entry.openStream()

const matchTransfer = (entry: ZipEntryItem, transferInformation: FileTransportInfo): boolean => {
  logger.debug(entry.path)
  const targetEntryToSearch = massageEntryPath(transferInformation.sourceFullName)
  if (!targetEntryToSearch) return true
  let result = false
  if (transferInformation.isSourceDirectory && entry.path.startsWith(targetEntryToSearch))
    result = true
  if (!transferInformation.isSourceDirectory && entry.path == targetEntryToSearch) result = true
  logger.debug(
    {
      path: entry.path,
      targetEntry: targetEntryToSearch,
      isDirectory: transferInformation.isSourceDirectory,
      result,
    },
    'debug on matchTransfer',
  )
  return result
}

const resolvePath = (entry: ZipEntryItem, info: FileTransportInfo): string => {
  const { sourceFolderName, sourceFileName, destinationPath, destinationFileName } = info

  // const entryPath = entry.path.split('/').join(path.sep);

  if (sourceFileName) {
    return path.join(destinationPath, destinationFileName || sourceFileName)
  }
  const remaining = entry.path.substring(sourceFolderName.length)
  //  if(entry.path.startsWith(sourceFolderName)){

  if (!remaining) return destinationPath
  return path.join(destinationPath, remaining.replace(/[/\\]+$/, ''))
  // }

  // // ② destinationFileName がある場合
  // if (destinationFileName) {
  //   return destinationPath
  //     ? path.join(destinationPath, destinationFileName)
  //     : destinationFileName;
  // }

  // // ③ relative path を作る（ここが重要）
  // let relativePath = entryPath;

  // if (isSourceDirectory && sourceFolderName) {
  //   const normalizedSource = sourceFolderName.replace(/[/\\]+$/, '');

  //   if (relativePath.startsWith(normalizedSource)) {
  //     relativePath = relativePath.slice(normalizedSource.length);

  //     // 先頭のセパレータを除去
  //     if (relativePath.startsWith(path.sep)) {
  //       relativePath = relativePath.slice(1);
  //     }
  //   }
  // }

  // // ❗ relativePath が空になるケースは directory entry
  // if (!relativePath) {
  //   return destinationPath;
  // }

  // // ④ destinationPath を付与
  // return destinationPath
  //   ? path.join(destinationPath, relativePath)
  //   : relativePath;
}
const extractEntry = (entry: ZipEntryItem, transferInformation: FileTransportInfo) => {
  logger.debug(`${entry.path} to be extracted `)
  return Effect.gen(function* () {
    const outputPath = resolvePath(entry, transferInformation)
    logger.debug(`OutputPath:${outputPath}`)
    if (entry.isDirectory) {
      return yield* makeDirectory(outputPath)
    }
    const dir = path.dirname(outputPath)
    yield* makeDirectory(dir)

    logger.debug(transferInformation, `Creating file:${outputPath},entry:${entry.path}`)

    return yield* entry.openStream().pipe(
      Stream.tap((chunk) => Effect.sync(() => console.log(outputPath, chunk.length))),
      writeStreamToFile(outputPath),
    )
  })
}

/**
 * Extracts a single zip file entry to a specified destination.
 *
 * @param targetFile The file entry to extract.
 *
 * @param destinationFullName The destination path.
 *
 * @returns An effect performing the extraction operation.
 */
export const extractSingleFileEntry = (
  targetFile: ZipFileEntryItem,
  destinationFullName: string,
) => {
  return Effect.gen(function* () {
    const arg = {
      sourceFilename: path.basename(targetFile.path),
      destinationFileName: path.basename(destinationFullName),
      destinationFolderName: path.dirname(destinationFullName),
    }
    yield* extractEntry(targetFile, new FileTransportInfo(arg))
  })
}

/**
 * Extracts selected zip entries from a stream based on transfer information.
 *
 * @param transferInformation Details about how and where to extract files.
 *
 * @returns A stream transformation effect.
 */
export const extractZip =
  <R = never>(
    // zipFilename: string,
    transferInformation: FileTransportInfo,
  ) =>
  (stream: Stream.Stream<ZipEntryItem, IOError, R>) => {
    return stream.pipe(
      Stream.filter((entry) => matchTransfer(entry, transferInformation)),
      Stream.mapEffect((entry) => extractEntry(entry, transferInformation), {
        concurrency: 1,
      }),
      Stream.runDrain,
    )
  }

/**
 * Extracts all entries from a zip stream into the target directory.
 *
 * @param destinationDirectory The directory to extract all files into.
 *
 * @returns A stream processing effect.
 */
export const extractZipAll =
  <R = never>(destinationDirectory: string) =>
  (stream: Stream.Stream<ZipEntryItem, IOError, R>) => {
    const transferInformation: FileTransportInfo = new FileTransportInfo({
      basePath: 'fake',
      destinationFolderName: destinationDirectory,
    })
    return extractZip<R>(transferInformation)(stream)
  }

/**
 * An object containing internal functions exported for testing purposes.
 */
export const exportedForTesting = {
  resolvePath,
}
