import { Stream } from 'effect';
import { AppError } from '../../base-error.js';

export const massageEntryPath = (fileName: string) => {
  return fileName ? fileName.replace(/\\/g, '/') : fileName;
};

export type ZipFileEntryItem = {
  _tag: 'zip';
  path: string;
  crc32: number;
  uncompressedSize: number;
  isDirectory: false;
  openStream: () => Stream.Stream<Uint8Array, AppError>;
};

export type TarFileEntryItem = {
  _tag: 'tar';
  path: string;
  uncompressedSize: number;
  isDirectory: false;
  openStream: () => Stream.Stream<Uint8Array, AppError>;
};

type ZipDirectoryEntryItem = {
  _tag: 'zip';
  path: string;
  isDirectory: true;
};
type TarDirectoryEntryItem = {
  _tag: 'tar';
  path: string;
  isDirectory: true;
  openStream: () => Stream.Stream<Uint8Array, AppError>;
};

export type ArchiveEntryItem =
  | ZipFileEntryItem
  | ZipDirectoryEntryItem
  | TarFileEntryItem
  | TarDirectoryEntryItem;
