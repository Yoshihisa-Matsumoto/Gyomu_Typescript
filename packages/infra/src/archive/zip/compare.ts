import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { Effect, Ref, Stream } from 'effect'
import { FullPath, IOError, withOptional, wrapInfraError } from '@gyomu/schema'
import { ensureEffect, fromSync } from '@gyomu/schema/effect'
import { jsonToCsv } from '../../csv/write.js'
import {
  emptyDir,
  makeDirectory,
  pathExists,
  readStringFromFile,
  removePath,
  writeStringToFile,
} from '../../fs/fs-utils.js'
import { extractSingleFileEntry } from './internals/read.js'
import { ZipService } from './ZipService.js'
import {
  filterDiff,
  handleMissingFileInComparison,
  internalCompareFileEntry,
  isComparisionExcludeTarget,
  shouldRunGitDiff,
} from './internals/compare.js'
import type { DiffDetail } from '@gyomu/schema/shared/object'
// import { fs } from '../../fs/index.js';
import type { ZipEntryItem, ZipFileEntryItem } from './internals/read.js'
import type { PlatformError } from 'effect/PlatformError'
import type { FileSystem } from 'effect'
import type {
  DiffResult,
  DiffSummary,
  DiffernceIgnoreRule,
  InterimOutputType,
  ZipCompareOption,
} from './internals/compare.js'

// export type DiffDetail = {
//   path: string;
//   sourceValue: string;
//   destinationValue: string;
// };

const summaryFilename = '@summary.csv'

/**
 * Compares two zip files and generates a summary of differences.
 *
 * @param option The configuration options for comparing zip files.
 *
 * @param compareFunc Optional custom comparison function.
 *
 * @returns An Effect yielding an array of DiffSummary or undefined if no differences were found, requiring FileSystem and ZipService.
 */
export const compareZip = (
  option: ZipCompareOption,
  compareFunc?: (option: {
    source: ZipFileEntryItem
    destination: ZipFileEntryItem
    filePath: string
    resultPath: string
  }) => Effect.Effect<DiffResult>,
): Effect.Effect<
  Array<DiffSummary> | undefined,
  IOError | PlatformError,
  FileSystem.FileSystem | ZipService
> => {
  const { sourceFilename, destinationFilename, resultPath } = option

  return Effect.gen(function* () {
    yield* ensureEffect(pathExists(sourceFilename), IOError, (e) => ({
      message: 'file not exist',
      target: sourceFilename,
      layer: 'archive' as const,
      operation: 'read' as const,
      cause: e,
    }))
    yield* ensureEffect(pathExists(destinationFilename), IOError, (e) => ({
      message: 'file not exist',
      target: destinationFilename,
      layer: 'archive' as const,
      operation: 'read' as const,
      cause: e,
    }))
    yield* emptyDir(resultPath).pipe(
      Effect.mapError((e) =>
        wrapInfraError(IOError, e, () => ({
          message: `Fail to prepare empty directory on ${resultPath}`,
          target: resultPath,
          layer: 'filesystem' as const,
          operation: 'read' as const,
        })),
      ),
    )

    // Zip取得
    const zip = yield* ZipService
    const [sourceEntriesMap, destinationEntriesMap] = yield* Effect.all([
      zip.unarchiveFromFile(sourceFilename).pipe(
        Stream.runFold(
          () => new Map<string, ZipEntryItem>(),
          (map, entry) => {
            map.set(entry.path, entry)
            return map
          },
        ),
      ),
      zip.unarchiveFromFile(destinationFilename).pipe(
        Stream.runFold(
          () => new Map<string, ZipEntryItem>(),
          (map, entry) => {
            map.set(entry.path, entry)
            return map
          },
        ),
      ),
    ])
    const state = yield* Ref.make<InterimOutputType>({
      sourceFiles: sourceEntriesMap,
      destinationFiles: destinationEntriesMap,
      results: [],
    })

    yield* Effect.forEach(
      Array.from(sourceEntriesMap.values()),
      (sourceFile) =>
        Effect.gen(function* () {
          if (
            option.fileNameExcludeRule &&
            isComparisionExcludeTarget(
              sourceFile.path.replaceAll('/', '\\'),
              option.fileNameExcludeRule,
              Object.keys(option.fileNameExcludeRule),
            )
          ) {
            // 比較除外条件に入ったものは何もしないvalues()
            return
          }
          const destinationFile = destinationEntriesMap.get(sourceFile.path)
          if (destinationFile) {
            if (sourceFile.isDirectory || destinationFile.isDirectory) {
              return
            }
            // File exist on both zip, need comparison
            yield* internalCompareFileEntry(sourceFile, destinationFile, state, option, compareFunc)
          } else {
            yield* handleMissingFileInComparison(sourceFile, true, state, option)
          }
        }),
      { concurrency: 1 },
    )
    yield* Effect.forEach(
      Array.from(destinationEntriesMap.values()),
      (destinationFile) =>
        Effect.gen(function* () {
          const sourceFile = sourceEntriesMap.get(destinationFile.path)
          if (sourceFile) return
          if (
            option.fileNameExcludeRule &&
            isComparisionExcludeTarget(
              destinationFile.path.replaceAll('/', '\\'),
              option.fileNameExcludeRule,
              Object.keys(option.fileNameExcludeRule),
            )
          ) {
            // 比較除外条件に入ったものは何もしない
            return
          }
          yield* handleMissingFileInComparison(destinationFile, false, state, option)
        }),
      { concurrency: 1 },
    )

    const results = yield* Ref.get(state).pipe(Effect.map((s) => s.results))

    if (results.length === 0) return undefined

    results.sort((a, b) => a.path.localeCompare(b.path))

    yield* jsonToCsv(
      results,
      withOptional({
        bom: true,
        quoted: true,
        recordDelimiter: option.recordDelimiter,
      }),
      {
        type: 'file',
        path: path.join(resultPath, summaryFilename),
      },
    )

    return results
  })
}

const runCompare = (
  sourceFile: ZipFileEntryItem,
  destinationFile: ZipFileEntryItem,

  resultPath: FullPath,
  compareFunc: (option: {
    source: ZipFileEntryItem
    destination: ZipFileEntryItem
    filePath: string
    resultPath: FullPath
  }) => Effect.Effect<DiffResult, IOError>,
) =>
  compareFunc({
    source: sourceFile,
    destination: destinationFile,
    filePath: sourceFile.path.replaceAll('/', '\\'),
    resultPath,
  })

const runGitDiffIfNeeded = (
  sourceFile: ZipFileEntryItem,
  destinationFile: ZipFileEntryItem,
  filePath: string,
  resultPath: FullPath,
  shouldRun: boolean,
) => (shouldRun ? compareTextfile(sourceFile, destinationFile, filePath, resultPath) : Effect.void)

const writeCsvIfNeeded = (
  diffDetailList: Array<DiffDetail>,
  resultPath: string,
  sourceFile: ZipFileEntryItem,
  option: ZipCompareOption,
) =>
  diffDetailList.length > 0
    ? Effect.gen(function* () {
        const filePath = path.join(resultPath, sourceFile.path.replaceAll('/', '\\')) + '.diff.csv'

        yield* jsonToCsv(
          diffDetailList.sort((a, b) => a.path.localeCompare(b.path)),
          withOptional({
            bom: true,
            quoted: true,
            recordDelimiter: option.recordDelimiter,
          }),
          { type: 'file', path: filePath },
        )
      })
    : Effect.void

/**
 * Executes the comparison workflow between two zip file entries.
 *
 * @param sourceFile The source zip file entry.
 *
 * @param destinationFile The destination zip file entry.
 *
 * @param resultPath The path to store comparison results.
 *
 * @param compareFunc The comparison function to execute.
 *
 * @param targetIgnoreRule Optional rules for ignoring specific differences.
 *
 * @param option The comparison configuration options.
 *
 * @returns An Effect yielding the diff results, filtered details, and original diff count.
 */
export const runCompareFuncFlow = (
  sourceFile: ZipFileEntryItem,
  destinationFile: ZipFileEntryItem,
  resultPath: FullPath,
  compareFunc: (option: {
    source: ZipFileEntryItem
    destination: ZipFileEntryItem
    filePath: string
    resultPath: FullPath
  }) => Effect.Effect<DiffResult, IOError>,
  targetIgnoreRule: DiffernceIgnoreRule | undefined,
  option: ZipCompareOption,
) => {
  return Effect.gen(function* () {
    const diffResult = yield* runCompare(sourceFile, destinationFile, resultPath, compareFunc)
    const { diffDetailList, originalNumberOfDiff } = filterDiff(diffResult, targetIgnoreRule)
    const shouldRun = shouldRunGitDiff(diffDetailList, originalNumberOfDiff, diffResult)
    yield* runGitDiffIfNeeded(
      sourceFile,
      destinationFile,
      sourceFile.path.replaceAll('/', '\\'),
      resultPath,
      shouldRun,
    )
    yield* writeCsvIfNeeded(diffDetailList, resultPath, sourceFile, option)
    return {
      diffResult,
      diffDetailList,
      originalNumberOfDiff,
    }
  })
}

const compareTextfile = (
  source: ZipFileEntryItem,
  destination: ZipFileEntryItem,
  filePath: string,
  resultPath: FullPath,
): Effect.Effect<boolean, IOError, FileSystem.FileSystem> => {
  return Effect.gen(function* () {
    const gitTempPath = path.join(tmpdir(), 'gitCompareTemp')
    const sourceFilename = path.join(gitTempPath, 'before')
    const destinationFilename = path.join(gitTempPath, 'after')
    const diffFilename = FullPath(path.join(resultPath, filePath.replaceAll('/', '\\') + '.diff'))

    yield* emptyDir(gitTempPath)

    yield* removePath(sourceFilename)
    yield* removePath(destinationFilename)

    const diffFilePath = path.dirname(diffFilename)
    yield* makeDirectory(diffFilePath)

    // ② source 展開
    yield* extractSingleFileEntry(source, sourceFilename)
    // ③ destination 展開
    yield* extractSingleFileEntry(destination, destinationFilename)
    // ④ git diff 実行
    const outputMessage = yield* fromSync(IOError, () => ({
      message: 'fail to generate diff files through git diff',
      layer: 'filesystem' as const,
      details: {
        sourceFilename,
        destinationFilename,
        diffFilename,
        gitTempPath,
      },
      operation: 'read' as const,
    }))(() => {
      const commandArg = [
        'diff',
        '--no-index',
        '--no-prefix',
        '--output',
        diffFilename,
        sourceFilename,
        destinationFilename,
      ]

      const result = spawnSync('git', commandArg, {
        cwd: gitTempPath,
      })

      if (result.error) {
        throw result.error
      }
      return result.output.toString()
    })

    if (!(yield* pathExists(diffFilename))) {
      throw new IOError({
        message: 'spawn on git diff fail',
        details: outputMessage,
        layer: 'filesystem',
        operation: 'read',
        cause: diffFilename,
      })
    }

    yield* removeUnnecessaryLinesFromDiffFile(diffFilename)

    return true
  })
}

const removeUnnecessaryLinesFromDiffFile = (diffFilename: string) => {
  return Effect.gen(function* () {
    const content = (yield* readStringFromFile(diffFilename, 'utf8'))
      .split('\n')
      .slice(4)
      .join('\n')
    yield* writeStringToFile(diffFilename, content, { flag: 'w' })
  })
}
