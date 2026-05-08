import { FsPath } from './types.js';

export const joinEntryPath = (...parts: FsPath[]): string =>
  parts.join('/').replace(/\/+/g, '/');
export const toEntryPath = (p: FsPath): string => p.replace(/\\/g, '/');
