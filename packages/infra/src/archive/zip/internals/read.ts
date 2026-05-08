import { Effect, Queue, Stream } from 'effect';
import yauzl, { RandomAccessReader } from 'yauzl';
import { IOError } from '@gyomu/core';
import { logger } from '@gyomu/core';
import {
  fromNodeCallback,
  //fromReadable,
  fromReadableControlled,
} from '../../../stream/bridge/nodeStream.js';
import { decode } from '@gyomu/core/shared/encoding';
import { wrapInfraError } from '@gyomu/core';
import { ArchiveEntryItem, massageEntryPath } from '../../common.js';
import { makeDirectory, writeStreamToFile } from '../../../fs/fs-utils.js';
import { FileSystem } from 'effect';
import { runSync } from 'effect/Effect';
import { FileTransportInfo } from '@gyomu/core/gyomu/file';
import path from 'path';

export type ZipEntryItem = Extract<ArchiveEntryItem, { _tag: 'zip' }>;
export type ZipFileEntryItem = Extract<ZipEntryItem, { isDirectory: false }>;
const unicode_flag: number = 0x800;

// type ZipCentralDirectory = {
//   zipFile: yauzl.ZipFile;
//   entries: Map<string, ZipEntryItem>;
// };

type ZipSource =
  | { type: 'file'; path: string }
  | { type: 'buffer'; buffer: Buffer }
  | { type: 'reader'; reader: RandomAccessReader; size: number };

const openZip = (source: ZipSource) =>
  fromNodeCallback<yauzl.ZipFile>((cb) => {
    switch (source.type) {
      case 'file':
        yauzl.open(
          source.path,
          { lazyEntries: true, decodeStrings: false },
          cb,
        );
        break;
      case 'buffer':
        yauzl.fromBuffer(
          source.buffer,
          { lazyEntries: true, decodeStrings: false },
          cb,
        );
        break;
      case 'reader':
        yauzl.fromRandomAccessReader(
          source.reader,
          source.size,
          { lazyEntries: true, decodeStrings: false },
          cb,
        );
        break;
    }
  });

export const withZipFile = (filePath: string) =>
  Effect.acquireRelease(openZip({ type: 'file', path: filePath }), (zip) =>
    Effect.sync(() => zip.close()),
  );

export const buildCentralDirectory = <R = never>(
  zip: yauzl.ZipFile,
  encoding?: string,
): Stream.Stream<ZipEntryItem, IOError, R> =>
  Stream.callback<ZipEntryItem, IOError>((queue) =>
    //const entries = new Map<string, ZipEntryItem>();
    Effect.sync(() => {
      zip.readEntry();

      zip.on('entry', (entry) => {
        const rawFileNameBuffer = entry.fileName as any as Buffer;

        const flags = entry.generalPurposeBitFlag;
        const isUnicode = (flags & unicode_flag) !== 0;
        const fileName = isUnicode
          ? rawFileNameBuffer.toString('utf-8')
          : decode(rawFileNameBuffer, encoding);

        logger.debug(fileName);
        if (/\/$/.test(fileName)) {
          logger.debug('directory');
          runSync(
            Queue.offer(queue, {
              _tag: 'zip',
              path: fileName,
              isDirectory: true,
            }),
          );
          zip.readEntry();
          // entries.set(fileName, {
          //   path: fileName,
          //   isDirectory: true,
          //   openStream: () => Stream.empty,
          // });
        } else {
          logger.debug('file');
          zip.openReadStream(entry, (err, rs) => {
            /**
             * fromReadableではうまくいかない。Node.js固有
             * もしかすると、Nodejs FileSystem固有のメソッドを作ったfromReadableを作ってそっちに変えたほうがいいかもしれない
             */
            const stream = fromReadableControlled(rs);
            runSync(
              Queue.offer(queue, {
                _tag: 'zip',
                path: fileName,
                crc32: entry.crc32,
                uncompressedSize: entry.uncompressedSize,
                isDirectory: false,
                openStream: () => stream,
              }),
            );
            zip.readEntry();
          });
        }
      });

      zip.on('end', () => {
        runSync(Queue.end(queue)); // エンド信号 (None/undefined で終了)
      });

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
        );
      });
    }),
  );

export const openZipEntries = (
  filePath: string,
  encoding?: string,
): Stream.Stream<ZipEntryItem, IOError, FileSystem.FileSystem> =>
  Stream.unwrap(
    Effect.map(withZipFile(filePath), (zip) =>
      buildCentralDirectory(zip, encoding),
    ),
  );

export const existsInZip =
  (entryName: string) =>
  <R = never>(entries: ZipEntryItem[]): Effect.Effect<boolean, never, R> => {
    const path = massageEntryPath(entryName);
    logger.debug(`massage:${path}`);
    const entry = entries.find((e) => e.path == path);
    logger.debug(entries.map((e) => e.path).join(','));
    if (!entry || entry.isDirectory) {
      return Effect.succeed(false);
    }

    return Effect.succeed(true);
  };
/**
 * ZipEntry の content をすべて読み込み、文字列として返す Effect を生成する
 */
export const readTextEntry = <R = never>(
  entry: ZipFileEntryItem,
  encoding: string = 'utf-8',
): Effect.Effect<string, IOError, R> =>
  readEntry(entry).pipe(
    Effect.map((chunks) => decode(Buffer.concat(chunks), encoding)),
  );
export const readEntry = <R = never>(
  entry: ZipFileEntryItem,
): Effect.Effect<Uint8Array<ArrayBufferLike>[], IOError, R> =>
  Stream.runCollect(entry.openStream());

export const readEntryStream = <R = never>(
  entry: ZipFileEntryItem,
): Stream.Stream<Uint8Array<ArrayBufferLike>, IOError, R> => entry.openStream();

const matchTransfer = (
  entry: ZipEntryItem,
  transferInformation: FileTransportInfo,
): boolean => {
  logger.debug(entry.path);
  const targetEntryToSearch = massageEntryPath(
    transferInformation.sourceFullName,
  );
  if (!targetEntryToSearch) return true;
  let result = false;
  if (
    transferInformation.isSourceDirectory &&
    entry.path.startsWith(targetEntryToSearch)
  )
    result = true;
  if (
    !transferInformation.isSourceDirectory &&
    entry.path == targetEntryToSearch
  )
    result = true;
  logger.debug(
    {
      path: entry.path,
      targetEntry: targetEntryToSearch,
      isDirectory: transferInformation.isSourceDirectory,
      result,
    },
    'debug on matchTransfer',
  );
  return result;
};

const resolvePath = (
  entry: ZipEntryItem,
  info: FileTransportInfo,
): Effect.Effect<string, never> => {
  const {
    sourceFolderName,
    sourceFileName,
    destinationPath,
    destinationFileName,
  } = info;

  return Effect.gen(function* () {
    //const entryPath = entry.path.split('/').join(path.sep);

    if (sourceFileName) {
      return path.join(destinationPath, destinationFileName ?? sourceFileName);
    }
    const remaining = entry.path.substring(sourceFolderName.length);
    //  if(entry.path.startsWith(sourceFolderName)){

    if (!remaining) return destinationPath;
    return path.join(destinationPath, remaining.replace(/[/\\]+$/, ''));
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
  });
};
const extractEntry = (
  entry: ZipEntryItem,
  transferInformation: FileTransportInfo,
) => {
  logger.debug(`${entry.path} to be extracted `);
  return Effect.gen(function* () {
    const outputPath = yield* resolvePath(entry, transferInformation);
    logger.debug(`OutputPath:${outputPath}`);
    if (entry.isDirectory) {
      return yield* makeDirectory(outputPath);
    }
    const dir = path.dirname(outputPath);
    yield* makeDirectory(dir);

    logger.debug(
      transferInformation,
      `Creating file:${outputPath},entry:${entry.path}`,
    );

    return yield* entry.openStream().pipe(
      Stream.tap((chunk) =>
        Effect.sync(() => console.log(outputPath, chunk.length)),
      ),
      writeStreamToFile(outputPath),
    );
  });
};

export const extractSingleFileEntry = (
  targetFile: ZipFileEntryItem,
  destinationFullName: string,
) => {
  return Effect.gen(function* () {
    const arg = {
      sourceFilename: path.basename(targetFile.path),
      destinationFileName: path.basename(destinationFullName),
      destinationFolderName: path.dirname(destinationFullName),
    };
    yield* extractEntry(targetFile, new FileTransportInfo(arg));
  });
};
export const extractZip =
  <R = never>(
    //zipFilename: string,
    transferInformation: FileTransportInfo,
  ) =>
  (stream: Stream.Stream<ZipEntryItem, IOError, R>) => {
    return stream.pipe(
      Stream.filter((entry) => matchTransfer(entry, transferInformation)),
      Stream.mapEffect((entry) => extractEntry(entry, transferInformation), {
        concurrency: 1,
      }),
      Stream.runDrain,
    );
  };

export const extractZipAll =
  <R = never>(destinationDirectory: string) =>
  (stream: Stream.Stream<ZipEntryItem, IOError, R>) => {
    const transferInformation: FileTransportInfo = new FileTransportInfo({
      basePath: 'fake',
      destinationFolderName: destinationDirectory,
    });
    return extractZip<R>(transferInformation)(stream);
  };

export const exportedForTesting = {
  resolvePath,
};
