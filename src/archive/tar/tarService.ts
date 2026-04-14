import { Effect, Layer, ServiceMap, Stream } from 'effect';
import { IOError } from '../../errors.js';
import { ArchiveEntryItem } from '../common.js';
import { AppError } from '../../base-error.js';
import { PlatformError } from 'effect/PlatformError';
import { FileSystem } from 'effect/FileSystem';
import { Path } from 'effect/Path';
import {
  createTar,
  extractTar,
  extractTarAll,
  extractTarSingleFile,
  extractTarToDirectory,
  readEntry,
  readEntryStream,
  readTextEntry,
  untar,
} from './internals/tar.js';
import { FileTransportInfo } from '../../gyomu/file/transport.js';

type TarEntryItem = Extract<ArchiveEntryItem, { _tag: 'tar' }>;

export class TarService extends ServiceMap.Service<
  TarService,
  {
    create: (options: {
      tarFileName: string;
      cwd: string;
      gzip?: boolean;
    }) => Effect.Effect<boolean, IOError>;

    unarchive: <E extends AppError, R>(
      source: Stream.Stream<Uint8Array, E, R>,
    ) => Stream.Stream<TarEntryItem, E | IOError, R>;

    extractAll: <E extends AppError, R>(
      destination: string,
    ) => (
      source: Stream.Stream<Uint8Array, E, R>,
    ) => Effect.Effect<
      void,
      AppError | PlatformError | E,
      FileSystem | Path | R
    >;

    extractSingle: <E extends AppError, R>(
      entryName: string,
      dest: string,
    ) => (
      source: Stream.Stream<Uint8Array, E, R>,
    ) => Effect.Effect<
      void,
      AppError | PlatformError | E,
      FileSystem | Path | R
    >;

    extractDirectory: (options: {
      targetDir: string;
      stripPath?: string;
    }) => <E extends AppError, R = never>(
      self: Stream.Stream<Uint8Array<ArrayBufferLike>, E, R>,
    ) => Effect.Effect<
      void,
      AppError | PlatformError | E,
      FileSystem | Path | R
    >;

    extract: <E extends AppError, R = never>(
      transferInformation: FileTransportInfo,
    ) => (
      self: Stream.Stream<Uint8Array<ArrayBufferLike>, E, R>,
    ) => Effect.Effect<
      void,
      AppError | PlatformError | E,
      FileSystem | Path | R
    >;

    readEntry: (entry: TarEntryItem) => Effect.Effect<Uint8Array[], AppError>;

    readTextEntry: (entry: TarEntryItem) => Effect.Effect<string, AppError>;

    readEntryStream: (
      entry: TarEntryItem,
    ) => Stream.Stream<Uint8Array, AppError>;
  }
>()('tar', {
  make: Effect.succeed({
    create: createTar,
    extractAll: extractTarAll,
    extractSingle: extractTarSingleFile,
    extractDirectory: extractTarToDirectory,
    extract: extractTar,
    unarchive: untar,
    readEntry: readEntry,
    readTextEntry: readTextEntry,
    readEntryStream: readEntryStream,
  }),
}) {
  static readonly live = Layer.effect(this, this.make);
}
