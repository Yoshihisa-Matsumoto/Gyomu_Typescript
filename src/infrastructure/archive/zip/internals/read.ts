import { Effect, Queue, Stream } from 'effect';
import yauzl, { RandomAccessReader } from 'yauzl';
import { IOError, unknownError } from '../../../../errors.js';
import { logger } from '../../../../logger.js';
import {
  fromNodeCallback,
  //fromReadable,
  fromReadableControlled,
} from '../../../../infrastructure/stream/bridge/nodeStream.js';
import { decode } from '../../../../shared/encoding/decode.js';
import { AppError } from '../../../../base-error.js';
import { ArchiveEntryItem, massageEntryPath } from '../../common.js';
import { writeToFile } from '../../../../infrastructure/fs/fs-utils.js';
import { FileSystem } from 'effect/FileSystem';
import { runSync } from 'effect/Effect';
import { FileTransportInfo } from '../../../../gyomu/file/transport.js';
import { fs } from '../../../fs/index.js';

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

export const buildCentralDirectory = <E extends AppError, R = never>(
  zip: yauzl.ZipFile,
  encoding?: string,
): Stream.Stream<ZipEntryItem, E | IOError, R> =>
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
        runSync(Queue.fail(queue, unknownError(IOError, err, 'Tar Error')));
      });
    }),
  );

export const openZipEntries = (
  filePath: string,
  encoding?: string,
): Stream.Stream<ZipEntryItem, AppError | IOError, FileSystem> =>
  Stream.unwrap(
    Effect.map(withZipFile(filePath), (zip) =>
      buildCentralDirectory(zip, encoding),
    ),
  );

export const existsInZip =
  (entryName: string) =>
  <E extends AppError, R = never>(
    entries: ZipEntryItem[],
  ): Effect.Effect<boolean, E | AppError, R> => {
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
): Effect.Effect<string, AppError, R> =>
  readEntry(entry).pipe(
    Effect.map((chunks) => decode(Buffer.concat(chunks), encoding)),
  );
export const readEntry = <R = never>(
  entry: ZipFileEntryItem,
): Effect.Effect<Uint8Array<ArrayBufferLike>[], AppError, R> =>
  Stream.runCollect(entry.openStream());

export const readEntryStream = <R = never>(
  entry: ZipFileEntryItem,
): Stream.Stream<Uint8Array<ArrayBufferLike>, AppError, R> =>
  entry.openStream();

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
  logger.debug([
    entry.path,
    targetEntryToSearch,
    transferInformation.isSourceDirectory,
    result,
  ]);
  return result;
};

const resolvePath = (entry: ZipEntryItem, info: FileTransportInfo): string => {
  const {
    sourceFolderName,
    sourceFileName,
    destinationPath,
    destinationFileName,
  } = info;

  //const entryPath = entry.path.split('/').join(platform.sep);

  if (sourceFileName) {
    return fs.join(destinationPath, destinationFileName ?? sourceFileName);
  }
  const remaining = entry.path.substring(sourceFolderName.length);
  //  if(entry.path.startsWith(sourceFolderName)){

  if (!remaining) return destinationPath;
  return fs.join(destinationPath, remaining.replace(/[/\\]+$/, ''));
  // }

  // // ② destinationFileName がある場合
  // if (destinationFileName) {
  //   return destinationPath
  //     ? platform.join(destinationPath, destinationFileName)
  //     : destinationFileName;
  // }

  // // ③ relative path を作る（ここが重要）
  // let relativePath = entryPath;

  // if (isSourceDirectory && sourceFolderName) {
  //   const normalizedSource = sourceFolderName.replace(/[/\\]+$/, '');

  //   if (relativePath.startsWith(normalizedSource)) {
  //     relativePath = relativePath.slice(normalizedSource.length);

  //     // 先頭のセパレータを除去
  //     if (relativePath.startsWith(platform.sep)) {
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
  //   ? platform.join(destinationPath, relativePath)
  //   : relativePath;
};
const extractEntry = (
  entry: ZipEntryItem,
  transferInformation: FileTransportInfo,
) => {
  logger.debug(`${entry.path} to be extracted `);
  return Effect.gen(function* () {
    const fileSystem = yield* FileSystem;
    const outputPath = resolvePath(entry, transferInformation);
    logger.debug(`OutputPath:${outputPath}`);
    if (entry.isDirectory) {
      return yield* fileSystem.makeDirectory(outputPath, { recursive: true });
    }
    const dir = fs.dirname(outputPath);
    yield* fileSystem.makeDirectory(dir, { recursive: true });

    logger.debug(`Creating file:${outputPath},entry:${entry.path}`);
    logger.debug(transferInformation);
    return yield* entry.openStream().pipe(
      Stream.tap((chunk) =>
        Effect.sync(() => console.log(outputPath, chunk.length)),
      ),
      writeToFile(outputPath),
    );
  });
};

export const extractSingleFileEntry = (
  targetFile: ZipFileEntryItem,
  destinationFullName: string,
) => {
  return extractEntry(
    targetFile,
    new FileTransportInfo({
      sourceFilename: fs.basename(targetFile.path),
      destinationFileName: fs.basename(destinationFullName),
      destinationFolderName: fs.dirname(destinationFullName),
    }),
  );
};
export const extractZip =
  <E extends AppError, R = never>(
    //zipFilename: string,
    transferInformation: FileTransportInfo,
  ) =>
  (stream: Stream.Stream<ZipEntryItem, IOError | E, R>) => {
    return stream.pipe(
      Stream.filter((entry) => matchTransfer(entry, transferInformation)),
      Stream.mapEffect((entry) => extractEntry(entry, transferInformation), {
        concurrency: 1,
      }),
      Stream.runDrain,
    );
  };

export const extractZipAll =
  <E extends AppError, R = never>(destinationDirectory: string) =>
  (stream: Stream.Stream<ZipEntryItem, IOError | E, R>) => {
    const transferInformation: FileTransportInfo = new FileTransportInfo({
      basePath: 'fake',
      destinationFolderName: destinationDirectory,
    });
    return extractZip<E, R>(transferInformation)(stream);
  };

export const exportedForTesting = {
  resolvePath,
};
