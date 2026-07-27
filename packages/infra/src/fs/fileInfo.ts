import path from 'node:path'
import { Effect, Option } from 'effect'
import { getFileStat } from './fs-utils.js'
import type { FileSystem } from 'effect'
import type { IOError } from '@gyomu/schema'

/**
 * Represents detailed metadata for a file or directory.
 */
export class FileInfo {
  /**
   * The name of the file.
   */
  readonly fileName: string

  /**
   * The absolute path of the file.
   */
  readonly fullPath: string

  /**
   * The name of the parent directory.
   */
  readonly directoryName: string

  /**
   * The path to the parent directory.
   */
  readonly directoryPath: string

  /**
   * The size of the file in bytes.
   */
  readonly size: number

  /**
   * The file extension.
   */
  readonly extension: string

  /**
   * The file creation timestamp.
   */
  readonly createTime: Date

  /**
   * The file modification timestamp.
   */
  readonly updateTime: Date

  /**
   * The file last access timestamp.
   */
  readonly lastAccessTime: Date

  /**
   * Indicates if the path is a file.
   */
  readonly isFile: boolean

  /**
   * Constructs a new FileInfo instance.
   *
   * @returns A new FileInfo instance.
   */
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

/**
 * Creates a FileInfo instance from the given file path.
 *
 * @param filePath The path to the file.
 *
 * @returns An effect that produces a FileInfo instance, requiring a FileSystem service and potentially failing with an IOError.
 *
 * @requires FileSystem.FileSystem
 */
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
