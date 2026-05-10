import type { Stream } from 'effect'
import type { IOError } from '@gyomu/core'

export const massageEntryPath = (fileName: string) => {
  return fileName ? fileName.replace(/\\/g, '/') : fileName
}

export type ZipFileEntryItem = {
  _tag: 'zip'
  path: string
  crc32: number
  uncompressedSize: number
  isDirectory: false
  openStream: () => Stream.Stream<Uint8Array, IOError>
}

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

export type ArchiveEntryItem =
  | ZipFileEntryItem
  | ZipDirectoryEntryItem
  | TarFileEntryItem
  | TarDirectoryEntryItem
