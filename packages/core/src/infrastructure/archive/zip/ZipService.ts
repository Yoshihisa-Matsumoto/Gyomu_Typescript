import { Effect, Layer, Path, ServiceMap, Stream } from 'effect';
import { IOError } from '../../../errors.js';
import { AppError } from '../../../base-error.js';
import { PlatformError } from 'effect/PlatformError';
import { FileTransportInfo } from '../../../gyomu/file/transport.js';
import { zipToStream } from './internals/write.js';
import {
  extractSingleFileEntry,
  extractZip,
  extractZipAll,
  openZipEntries,
  readEntry,
  readEntryStream,
  readTextEntry,
  ZipEntryItem,
  ZipFileEntryItem,
} from './internals/read.js';
import { FileSystem } from 'effect';
// import { Path } from 'effect/Path';

export class ZipService extends ServiceMap.Service<
  ZipService,
  {
    create: (
      transferInformationList: FileTransportInfo[],
    ) => Stream.Stream<Uint8Array, IOError, FileSystem.FileSystem>;

    unarchiveFromFile: (
      filePath: string,
      encoding?: string,
    ) => Stream.Stream<ZipEntryItem, AppError | IOError, FileSystem.FileSystem>;

    extractAll: <E extends AppError, R = never>(
      destination: string,
    ) => (
      source: Stream.Stream<ZipEntryItem, IOError | E, R>,
    ) => Effect.Effect<
      void,
      IOError | AppError | PlatformError | E,
      FileSystem.FileSystem | Path.Path | R
    >;

    extractSingle: (
      targetFile: ZipFileEntryItem,
      destinationFullName: string,
    ) => Effect.Effect<
      void,
      AppError | PlatformError,
      FileSystem.FileSystem | Path.Path
    >;

    extract: <E extends AppError, R = never>(
      transferInformation: FileTransportInfo,
    ) => (
      self: Stream.Stream<ZipEntryItem, IOError | E, R>,
    ) => Effect.Effect<
      void,
      IOError | AppError | PlatformError | E,
      FileSystem.FileSystem | Path.Path | R
    >;

    readEntry: <R = never>(
      entry: ZipFileEntryItem,
    ) => Effect.Effect<Uint8Array[], AppError, R>;

    readTextEntry: <R = never>(
      entry: ZipFileEntryItem,
      encoding: string,
    ) => Effect.Effect<string, AppError, R>;

    readEntryStream: (
      entry: ZipFileEntryItem,
    ) => Stream.Stream<Uint8Array, AppError>;
  }
>()('zip', {
  make: Effect.succeed({
    create: zipToStream,
    extractAll: extractZipAll,
    extractSingle: extractSingleFileEntry,
    extract: extractZip,
    unarchiveFromFile: openZipEntries,
    readEntry: readEntry,
    readTextEntry: readTextEntry,
    readEntryStream: readEntryStream,
  }),
}) {
  static readonly live = Layer.effect(this, this.make);
}
