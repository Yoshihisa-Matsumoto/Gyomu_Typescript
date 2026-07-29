import fs from 'node:fs'
import type { FileSystem } from 'effect'
import type { FullPath } from '@gyomu/schema'

/**
 * Represents a readable file stream.
 */
export type ReadStream = fs.ReadStream

/**
 * Exposes standard Node.js file system constants.
 */
export const fsConstants = fs.constants

/**
 * Contains metadata describing a file system entry, including its name, path, type, and categorization as a file or directory.
 */
export type EntryInfo = {
  name: string
  path: FullPath
  type: FileSystem.File.Type
  isFile: boolean
  isDirectory: boolean
}
