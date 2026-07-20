/**
 * Defines the available file system filtering criteria.
 */
export const FilterType = {
  CreateTime: 'Create Time',
  LastAccessTime: 'Last Access Time',
  LastModifiedTime: 'Last Modified Time',
} as const

/**
 * Represents the available filter types for file operations.
 */
export type FilterType = (typeof FilterType)[keyof typeof FilterType]

/**
 * Defines the supported comparison operations for files.
 */
export const FileCompareType = {
  Equal: 'Equal',
  Larger: 'Larger',
  Less: 'Less',
  LargerOrEqual: 'LargerOrEqual',
  LessOrEqual: 'LessOrEqual',
} as const

/**
 * Defines comparison operations for files.
 */
export type FileCompareType = (typeof FileCompareType)[keyof typeof FileCompareType]

/**
 * Defines supported file archive formats.
 */
export const FileArchiveType = {
  Zip: 'zip',
  Tgz: 'tgz',
  BZip2: 'bz2',
  GZip: 'gz',
  Tar: 'tar',
  GuessFromFileName: 'unknown',
} as const

/**
 * Specifies supported file archive formats.
 */
export type FileArchiveType = (typeof FileArchiveType)[keyof typeof FileArchiveType]

/**
 * Represents metadata information for a file or directory.
 */
export class FileInfo {
  /**
   * The name of the file.
   */
  readonly fileName: string

  /**
   * The absolute file system path.
   */
  readonly fullPath: string

  /**
   * The name of the directory containing the file.
   */
  readonly directoryName: string

  /**
   * The full file path to the parent directory.
   */
  readonly directoryPath: string

  /**
   * The file size in bytes.
   */
  readonly size: number

  /**
   * The file extension.
   */
  readonly extension: string

  /**
   * The timestamp when the file was created.
   */
  readonly createTime: Date

  /**
   * The timestamp when the file was last updated.
   */
  readonly updateTime: Date

  /**
   * The timestamp when the file was last accessed.
   */
  readonly lastAccessTime: Date

  /**
   * Indicates whether the entity is a file.
   */
  readonly isFile: boolean

  /**
   * Constructs a new FileInfo instance.
   *
   * @param args Configuration object containing file metadata details.
   *
   * @returns The newly initialized FileInfo instance.
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
