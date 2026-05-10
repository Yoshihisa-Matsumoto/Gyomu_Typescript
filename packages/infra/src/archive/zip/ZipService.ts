import { Context, Effect, Layer } from 'effect'
import { zipToStream } from './internals/write.js'
import {
  extractSingleFileEntry,
  extractZip,
  extractZipAll,
  openZipEntries,
  readEntry,
  readEntryStream,
  readTextEntry,
} from './internals/read.js'
import type { FileSystem, Stream } from 'effect'
import type { IOError } from '@gyomu/core'
import type { PlatformError } from 'effect/PlatformError'
import type { FileTransportInfo } from '@gyomu/core/gyomu/file'
import type { ZipEntryItem, ZipFileEntryItem } from './internals/read.js'
// import { Path } from 'effect/Path';

export class ZipService extends Context.Service<
  ZipService,
  {
    create: (
      transferInformationList: Array<FileTransportInfo>,
    ) => Stream.Stream<Uint8Array, IOError, FileSystem.FileSystem>

    unarchiveFromFile: (
      filePath: string,
      encoding?: string,
    ) => Stream.Stream<ZipEntryItem, IOError, FileSystem.FileSystem>

    extractAll: <R = never>(
      destination: string,
    ) => (
      source: Stream.Stream<ZipEntryItem, IOError, R>,
    ) => Effect.Effect<void, IOError | PlatformError, FileSystem.FileSystem | R>

    extractSingle: (
      targetFile: ZipFileEntryItem,
      destinationFullName: string,
    ) => Effect.Effect<void, IOError | PlatformError, FileSystem.FileSystem>

    extract: <R = never>(
      transferInformation: FileTransportInfo,
    ) => (
      self: Stream.Stream<ZipEntryItem, IOError, R>,
    ) => Effect.Effect<void, IOError | PlatformError, FileSystem.FileSystem | R>

    readEntry: <R = never>(entry: ZipFileEntryItem) => Effect.Effect<Array<Uint8Array>, IOError, R>

    readTextEntry: <R = never>(
      entry: ZipFileEntryItem,
      encoding: string,
    ) => Effect.Effect<string, IOError, R>

    readEntryStream: (entry: ZipFileEntryItem) => Stream.Stream<Uint8Array, IOError>
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
  static readonly live = Layer.effect(this, this.make)
}
