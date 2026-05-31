import path from 'node:path'
import { Effect, Layer } from 'effect'
import { compareAsc } from 'date-fns'
import { FileSearchService } from '@gyomu/schema/shared/fs'
import { FileCompareType, FilterType } from '@gyomu/schema/gyomu/file'
import fg from 'fast-glob'
import { createFileInfo } from './fileInfo.js'
import { pathExists } from './fs-utils.js'
import type { FileSearchQuery } from '@gyomu/schema/shared/fs'
import type { FileFilterInfo } from '@gyomu/schema/gyomu/file'
import type { FileSystem } from 'effect'

import type { FileInfo } from './fileInfo.js'
import type { IOError } from '@gyomu/schema'

const enumerateFilePaths = (
  query: FileSearchQuery,
): Effect.Effect<ReadonlyArray<string>, IOError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    if (!(yield* pathExists(query.parentDirectory))) {
      return []
    }

    const includes =
      query.includes && query.includes.length > 0
        ? query.includes
        : [query.recursive ? '**/*' : '*']

    const paths = yield* Effect.tryPromise({
      try: () =>
        fg([...includes], {
          cwd: path.resolve(query.parentDirectory),

          ignore: [...(query.excludes ?? [])],

          absolute: true,

          onlyFiles: true,

          dot: false,
        }),

      catch: (error) => error as IOError,
    })

    return paths
  })
const searchFunc = (
  query: FileSearchQuery,
): Effect.Effect<Array<FileInfo>, IOError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const filePaths = yield* enumerateFilePaths(query)

    const results = yield* Effect.forEach(
      filePaths,
      (filePath) =>
        Effect.gen(function* () {
          const [ok, fileInfo] = yield* isFileValid(filePath, query.metadataFilters ?? [])

          return ok ? [fileInfo] : []
        }),
      { concurrency: 1 },
    )

    return results.flat()
  })

const isFileValid = (
  fileFullPath: string,
  filterConditions: ReadonlyArray<FileFilterInfo>,
): Effect.Effect<[boolean, FileInfo], IOError, FileSystem.FileSystem> => {
  let isMatch = true
  return Effect.gen(function* () {
    const fileInformation = yield* createFileInfo(fileFullPath)

    if (!fileInformation.isFile) return [false, fileInformation]

    if (filterConditions.length === 0) return [true, fileInformation]

    for (const filterInfo of filterConditions) {
      isMatch = isFileValidForFileter(fileInformation, filterInfo)
      if (!isMatch) break
    }
    return [isMatch, fileInformation]
  })
}
const isFileValidForFileter = (
  fileInformation: FileInfo,
  filterInformation: FileFilterInfo,
): boolean => {
  switch (filterInformation.kind) {
    case FilterType.CreateTime:
      return isFileDateMatch(
        fileInformation.createTime,
        filterInformation.targetDate,
        filterInformation.operator,
      )
    case FilterType.LastAccessTime:
      return isFileDateMatch(
        fileInformation.lastAccessTime,
        filterInformation.targetDate,
        filterInformation.operator,
      )
    case FilterType.LastModifiedTime:
      return isFileDateMatch(
        fileInformation.updateTime,
        filterInformation.targetDate,
        filterInformation.operator,
      )
  }
}

const isFileDateMatch = (
  fileDate: Date,
  targetFilter: Date,
  compareType: FileCompareType,
): boolean => {
  const result = compareAsc(fileDate, targetFilter)
  switch (compareType) {
    case FileCompareType.Equal:
      return result === 0
    case FileCompareType.Larger:
      return result > 0
    case FileCompareType.LargerOrEqual:
      return result >= 0
    case FileCompareType.Less:
      return result < 0
    case FileCompareType.LessOrEqual:
      return result <= 0
  }
}

export const FileSearchServiceLayer = Layer.effect(
  FileSearchService,
  Effect.succeed({
    search: searchFunc,
  }),
)
