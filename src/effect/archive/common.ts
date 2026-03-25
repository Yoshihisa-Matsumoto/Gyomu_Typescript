import { Stream } from 'effect';
import { AppError } from '../../base-error.js';

export const massageEntryPath = (fileName: string) => {
  return fileName ? fileName.replace(/\\/g, '/') : fileName;
};

export type FileEntryItem = {
  path: string;
  crc32?: number;
  uncompressedSize: number;
  isDirectory: false;
  openStream: () => Stream.Stream<Uint8Array, AppError>;
};
type DirectoryEntryItem = {
  path: string;
  isDirectory: true;
  openStream: () => Stream.Stream<Uint8Array, AppError>;
};
export type ArchiveEntryItem = FileEntryItem | DirectoryEntryItem;
