export const FilterType = {
  FileName: 'Name',
  CreateTime: 'Create Time',
  LastAccessTime: 'Last Access Time',
  LastModifiedTime: 'Last Modified Time',
} as const

export type FilterType = (typeof FilterType)[keyof typeof FilterType]

export const FileCompareType = {
  Equal: 'Equal',
  Larger: 'Larger',
  Less: 'Less',
  LargerOrEqual: 'LargerOrEqual',
  LessOrEqual: 'LessOrEqual',
} as const

export type FileCompareType = (typeof FileCompareType)[keyof typeof FileCompareType]

export const FileArchiveType = {
  Zip: 'zip',
  Tgz: 'tgz',
  BZip2: 'bz2',
  GZip: 'gz',
  Tar: 'tar',
  GuessFromFileName: 'unknown',
} as const
export type FileArchiveType = (typeof FileArchiveType)[keyof typeof FileArchiveType]

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
