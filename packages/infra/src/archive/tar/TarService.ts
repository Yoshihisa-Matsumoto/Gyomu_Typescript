import { Effect, Layer, ServiceMap, Stream } from 'effect';
import { IOError } from '@gyomu/core';
import { ArchiveEntryItem } from '../common.js';
import { PlatformError } from 'effect/PlatformError';
import { FileSystem } from 'effect';
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
import { FileTransportInfo } from '@gyomu/core/gyomu/file';

type TarEntryItem = Extract<ArchiveEntryItem, { _tag: 'tar' }>;

export class TarService extends ServiceMap.Service<
  TarService,
  {
    create: (options: {
      tarFileName: string;
      cwd: string;
      gzip?: boolean;
    }) => Effect.Effect<boolean, IOError>;

    unarchive: <R>(
      source: Stream.Stream<Uint8Array, IOError, R>,
    ) => Stream.Stream<TarEntryItem, IOError, R>;

    extractAll: <R>(
      destination: string,
    ) => (
      source: Stream.Stream<Uint8Array, IOError, R>,
    ) => Effect.Effect<
      void,
      IOError | PlatformError,
      FileSystem.FileSystem | R
    >;

    extractSingle: <R>(
      entryName: string,
      dest: string,
    ) => (
      source: Stream.Stream<Uint8Array, IOError, R>,
    ) => Effect.Effect<
      void,
      IOError | PlatformError,
      FileSystem.FileSystem | R
    >;

    extractDirectory: (options: {
      targetDir: string;
      stripPath?: string;
    }) => <R = never>(
      self: Stream.Stream<Uint8Array<ArrayBufferLike>, IOError, R>,
    ) => Effect.Effect<
      void,
      PlatformError | IOError,
      FileSystem.FileSystem | R
    >;

    extract: <R = never>(
      transferInformation: FileTransportInfo,
    ) => (
      self: Stream.Stream<Uint8Array<ArrayBufferLike>, IOError, R>,
    ) => Effect.Effect<
      void,
      PlatformError | IOError,
      FileSystem.FileSystem | R
    >;

    readEntry: (entry: TarEntryItem) => Effect.Effect<Uint8Array[], IOError>;

    readTextEntry: (entry: TarEntryItem) => Effect.Effect<string, IOError>;

    readEntryStream: (
      entry: TarEntryItem,
    ) => Stream.Stream<Uint8Array, IOError>;
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
