import path from 'node:path'
import { Effect, Option } from 'effect'
import { getFileStat } from './fs-utils.js'
import type { FileSystem } from 'effect'
import type { IOError } from '@gyomu/schema'

export class FileInfo {
  readonly fileName: string
  readonly fullPath: string
  readonly directoryName: string
  readonly directoryPath: string
  readonly size: number
  readonly extension: string
  readonly createTime: Date
  readonly updateTime: Date
  readonly lastAccessTime: Date
  readonly isFile: boolean

  constructor(args: {
    fileName: string
    fullPath: string
    directoryName: string
    directoryPath: string
    size: number
    extension: string
    createTime: Date
    updateTime: Date
    lastAccessTime: Date
    isFile: boolean
  }) {
    this.fileName = args.fileName
    this.fullPath = args.fullPath
    this.directoryName = args.directoryName
    this.directoryPath = args.directoryPath
    this.size = args.size
    this.extension = args.extension
    this.createTime = args.createTime
    this.updateTime = args.updateTime
    this.lastAccessTime = args.lastAccessTime
    this.isFile = args.isFile
  }
}

export const createFileInfo = (
  filePath: string,
): Effect.Effect<FileInfo, IOError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const stats = yield* getFileStat(filePath)

    const isFile = stats.type === 'File'

    const fullPath = path.resolve(filePath)

    return new FileInfo({
      isFile,
      fileName: isFile ? path.basename(filePath) : '',
      extension: isFile ? path.extname(filePath) : '',
      fullPath,
      directoryName: path.basename(path.dirname(filePath)),
      directoryPath: path.dirname(fullPath),
      size: Number(stats.size),
      createTime: Option.getOrElse(
        Option.orElse(stats.birthtime, () => stats.mtime),
        () => new Date(0),
      ),
      updateTime: Option.getOrElse(stats.mtime, () => new Date(0)),
      lastAccessTime: Option.getOrElse(stats.atime, () =>
        Option.getOrElse(stats.mtime, () => new Date(0)),
      ),
    })
  })
