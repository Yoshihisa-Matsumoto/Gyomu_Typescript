import fs from 'node:fs'
import type { FileSystem } from 'effect'
import type { FullPath } from '@gyomu/schema'

export type ReadStream = fs.ReadStream
export const fsConstants = fs.constants

export type EntryInfo = {
  name: string
  path: FullPath
  type: FileSystem.File.Type
  isFile: boolean
  isDirectory: boolean
}
