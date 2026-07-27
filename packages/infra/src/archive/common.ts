import type { Stream } from 'effect'
import type { IOError } from '@gyomu/schema'

/**
 * Normalizes a file path by replacing backslashes with forward slashes.
 *
 * @param fileName The file path to normalize.
 *
 * @returns The normalized file path string.
 */
export const massageEntryPath = (fileName: string) => {
  return fileName ? fileName.replace(/\\/g, '/') : fileName
}

/**
 * Defines an entry representing a file within a ZIP archive, including path, CRC32, size, and a stream to access contents.
 */
export type ZipFileEntryItem = {
  _tag: 'zip'
  path: string
  crc32: number
  uncompressedSize: number
  isDirectory: false
  openStream: () => Stream.Stream<Uint8Array, IOError>
}

/**
 * Defines an entry representing a file within a TAR archive, including path, size, and a stream to access contents.
 */
export type TarFileEntryItem = {
  _tag: 'tar'
  path: string
  uncompressedSize: number
  isDirectory: false
  openStream: () => Stream.Stream<Uint8Array, IOError>
}

type ZipDirectoryEntryItem = {
  _tag: 'zip'
  path: string
  isDirectory: true
}
type TarDirectoryEntryItem = {
  _tag: 'tar'
  path: string
  isDirectory: true
  openStream: () => Stream.Stream<Uint8Array, IOError>
}

/**
 * A union type representing various archive entry items, including ZIP and TAR files and directories.
 */
export type ArchiveEntryItem =
  | ZipFileEntryItem
  | ZipDirectoryEntryItem
  | TarFileEntryItem
  | TarDirectoryEntryItem
