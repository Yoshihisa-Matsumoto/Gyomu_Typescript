import path from 'node:path'
import { Effect, Ref } from 'effect'
import { runCompareFuncFlow } from '../compare.js'
import { extractSingleFileEntry } from './read.js'
import type { FileSystem } from 'effect'
import type { DiffDetail } from '@gyomu/schema/shared/object'

import type { ZipEntryItem, ZipFileEntryItem } from './read.js'
import type { PlatformError } from 'effect/PlatformError'
import type { FullPath, IOError } from '@gyomu/schema'

/**
 * Defines a rule to ignore differences for files matching a specific regular expression, optionally filtered by source or destination values.
 */
export type DiffernceIgnoreRule = {
  filePathRegExpression: string
  type: 'Different'
  criteria: Array<{
    pathRegExpression: string
    sourceValue?: string
    destinationValue?: string
  }>
} // export type FileEntry = {

/**
 * Defines the output state during comparison, tracking source files, destination files, and generated diff summaries.
 */
export type InterimOutputType = {
  sourceFiles: Map<string, ZipEntryItem>
  destinationFiles: Map<string, ZipEntryItem>
  results: Array<DiffSummary>
}

/**
 * Defines configuration options for comparing two ZIP files, including path mappings, ignore rules, and behavioral settings.
 */
export type ZipCompareOption = {
  sourceFilename: FullPath
  destinationFilename: FullPath
  resultPath: FullPath
  diffIgnoreRule?: Array<IgnoreRule>
  fileNameExcludeRule?: FileNameExclusionRule
  includeOriginalFileInDiff?: boolean
  recordDelimiter?: 'windows' | 'unix'
}

/**
 * Represents a union type of rules for ignoring differences or handling files present in only one party during comparison.
 */
export type IgnoreRule = DiffernceIgnoreRule | ExistInOnlyOnePartyIgnoreRule

/**
 * Filters a diff result based on the provided ignore rules.
 *
 * @param diffResult The raw diff result object to filter.
 *
 * @param rule Optional ignore rule to exclude specific diff items.
 *
 * @returns Returns an object containing the filtered list of diff details and the original count.
 */
export const filterDiff = (diffResult: DiffResult, rule?: DiffernceIgnoreRule) => {
  const diffDetailList = [...diffResult.diff]
  const originalNumberOfDiff = diffDetailList.length

  if (!rule) {
    return { diffDetailList, originalNumberOfDiff }
  }

  // if (!rule.criteria) {
  //   return { diffDetailList: [], originalNumberOfDiff };
  // }

  return {
    diffDetailList: diffDetailList.filter((diff) => {
      return !rule.criteria.some(
        (c) =>
          new RegExp(c.pathRegExpression).test(diff.path) &&
          (!c.sourceValue || c.sourceValue === diff.sourceValue) &&
          (!c.destinationValue || c.destinationValue === diff.destinationValue),
      )
    }),
    originalNumberOfDiff,
  }
}

/**
 * Determines whether an intensive Git diff operation should be executed based on the provided diff details and statistics.
 *
 * @param diffDetailList The current list of diff details.
 *
 * @param originalNumberOfDiff The initial count of diff items.
 *
 * @param diffResult The full comparison result.
 *
 * @returns True if Git diff should run, otherwise false.
 */
export const shouldRunGitDiff = (
  diffDetailList: Array<DiffDetail>,
  originalNumberOfDiff: number,
  diffResult: DiffResult,
) =>
  (originalNumberOfDiff === 0 && diffResult.diffExist) ||
  diffDetailList.length > 5 ||
  diffDetailList.some((d) => d.sourceValue.length > 100 || d.destinationValue.length > 100)

/**
 * Checks if a given file path should be excluded from comparison based on the provided exclusion rules and categories.
 *
 * @param filePath The file path to evaluate.
 *
 * @param rule The exclusion rules to apply.
 *
 * @param categories List of directories or categories to check against.
 *
 * @returns True if the file should be excluded, otherwise false.
 */
export const isComparisionExcludeTarget = (
  filePath: string,
  rule: FileNameExclusionRule,
  categories: Array<string>,
): boolean => {
  const directories = filePath.split(/[\\/]+/)
  const fileName = path.basename(filePath)
  let isPathInScope = false
  let targetCategry = ''
  let isExclude = false
  for (const directory of directories) {
    if (categories.includes(directory)) {
      isPathInScope = true
      targetCategry = directory
      break
    }
  }
  if (isPathInScope) {
    const criteriaList = rule[targetCategry] ?? []

    for (const criteria of criteriaList) {
      if (criteria.type === 'include') {
        if (
          criteria.target &&
          criteria.target.length > 0 &&
          !criteria.target.find((t) => fileName.includes(t))
        ) {
          isExclude = true
        }
        if (
          criteria.targetRegEx &&
          criteria.targetRegEx.length > 0 &&
          !criteria.targetRegEx.find((r) => new RegExp(r).test(fileName))
        ) {
          isExclude = true
        }
      } else {
        if (
          criteria.target &&
          criteria.target.length > 0 &&
          criteria.target.find((t) => fileName.includes(t))
        ) {
          isExclude = true
        }
        if (
          !isExclude &&
          criteria.targetRegEx &&
          criteria.targetRegEx.length > 0 &&
          criteria.targetRegEx.find((r) => new RegExp(r).test(fileName))
        ) {
          isExclude = true
        }
      }
      if (isExclude) break
    }
  }
  // if(isExclude)
  // {
  //   logger.info(filePath);
  // }
  return isExclude
}

/**
 * Defines rules for excluding or including files based on directory paths and specific target name matching.
 */
export type FileNameExclusionRule = {
  [path: string]: Array<{
    type: 'include' | 'exclude'
    target?: Array<string>
    targetRegEx?: Array<string>
  }>
}

//   openStream: () => Stream.Stream<Uint8Array, AppError>;
// };

/**
 * Represents the outcome of a comparison, containing a list of detected differences and a flag indicating if any exist.
 */
export type DiffResult = {
  diff: Array<DiffDetail>
  diffExist: boolean
}

/**
 * Handles files that exist in only one of the compared archives by checking ignore rules and optionally extracting them.
 *
 * @param existingFile The entry metadata of the existing file.
 *
 * @param isSourceExist Indicates if the file exists in the source.
 *
 * @param interimOutput A mutable reference to the comparison output state.
 *
 * @param option Comparison configuration options.
 *
 * @returns An Effect containing the updated output state reference.
 */
export const handleMissingFileInComparison = (
  existingFile: ZipEntryItem,
  isSourceExist: boolean,
  interimOutput: Ref.Ref<InterimOutputType>,
  option: ZipCompareOption,
) => {
  const { resultPath, diffIgnoreRule } = option
  const existingPart = isSourceExist ? 'Source' : 'Destination'

  let targetIgnoreRule: IgnoreRule | undefined = undefined
  // Destination File Not Exist
  if (diffIgnoreRule) {
    targetIgnoreRule = diffIgnoreRule.find(
      (r) =>
        r.type === `Only in ${existingPart}` &&
        new RegExp(r.filePathRegExpression).test(existingFile.path),
    )
  }
  if (!targetIgnoreRule) {
    if (existingFile.isDirectory) return Effect.succeed(interimOutput)

    return Effect.gen(function* () {
      yield* Ref.update(interimOutput, (output) => {
        output.results.push({
          path: existingFile.path,
          diff: `Only in ${existingPart}`,
        })
        return output
      })
      const filePath = path.join(resultPath, existingFile.path.replaceAll('/', '\\'))
      return yield* Effect.as(extractSingleFileEntry(existingFile, filePath), interimOutput)
    })
  }
  return Effect.succeed(interimOutput)
}

/**
 * Represents a summary record of a single file difference, identifying its path and the nature of the discrepancy.
 */
export type DiffSummary = {
  path: string
  diff: 'Only in Source' | 'Only in Destination' | 'Different'
}

/**
 * Defines a rule to ignore files that are present only in the source or only in the destination archive.
 */
export type ExistInOnlyOnePartyIgnoreRule = {
  filePathRegExpression: string
  type: 'Only in Source' | 'Only in Destination'
}

/**
 * Compares two individual file entries and updates the interim output with differences, optionally invoking a custom comparison function.
 *
 * @param sourceFile The file entry from the source.
 *
 * @param destinationFile The file entry from the destination.
 *
 * @param interimOutput The reference to the comparison results state.
 *
 * @param option Comparison configuration settings.
 *
 * @param compareFunc Optional custom comparison logic for detailed diffing.
 *
 * @returns An Effect representing the completion of the file comparison.
 */
export const internalCompareFileEntry = (
  sourceFile: ZipFileEntryItem,
  destinationFile: ZipFileEntryItem,
  interimOutput: Ref.Ref<InterimOutputType>,
  option: ZipCompareOption,
  compareFunc?: (option: {
    source: ZipFileEntryItem
    destination: ZipFileEntryItem
    filePath: string
    resultPath: FullPath
  }) => Effect.Effect<DiffResult, IOError>,
) => {
  const { resultPath, diffIgnoreRule } = option
  // const { results } = interimOutput;
  let targetIgnoreRule: IgnoreRule | undefined = undefined
  if (
    sourceFile.uncompressedSize === destinationFile.uncompressedSize &&
    sourceFile.crc32 === destinationFile.crc32
  ) {
    // Exact Same Content
    return Effect.succeed(interimOutput)
  }

  // Something changed
  const diffSummaryRecord: DiffSummary | undefined = {
    path: sourceFile.path,
    diff: 'Different',
  }
  if (diffIgnoreRule) {
    targetIgnoreRule = diffIgnoreRule.find(
      (r) => r.type === 'Different' && new RegExp(r.filePathRegExpression).test(sourceFile.path),
    )
  }

  const result = Effect.gen(function* () {
    if (compareFunc) {
      yield* runCompareFuncFlow(
        sourceFile,
        destinationFile,
        resultPath,
        compareFunc,
        targetIgnoreRule as DiffernceIgnoreRule | undefined,
        option,
      )
    }
    // if (!diffSummaryRecord) return interimOutput
    yield* Ref.update(interimOutput, (output) => {
      output.results.push(diffSummaryRecord)
      return output
    })

    if (!option.includeOriginalFileInDiff) return interimOutput

    const effects: Array<Effect.Effect<void, IOError | PlatformError, FileSystem.FileSystem>> = []

    const sourcePath = path.join(resultPath, sourceFile.path.replaceAll('/', '\\') + '.source')

    // if (!sourceFile.isDirectory) {
    effects.push(extractSingleFileEntry(sourceFile, sourcePath))
    // }

    const destinationPath = path.join(
      resultPath,
      destinationFile.path.replaceAll('/', '\\') + '.destination',
    )

    effects.push(extractSingleFileEntry(destinationFile, destinationPath))

    const allResults = yield* Effect.as(Effect.all(effects), interimOutput)
    return allResults
  })
  return result
}
