import { join, relative } from 'node:path'
import { FileSearchService } from '@gyomu/schema/shared/fs'
import { ProjectRelativePath } from '@gyomu/schema/typescript'
import { Effect } from 'effect'
import { normalizePath } from '@gyomu/ts-analysis'
import type { FullPath } from '@gyomu/schema'
import type { ResolvedPackageExport, ResolvedSourceFile } from './types.js'

/**
 * Searches for source files within a project directory that match the path specified in the provided package export.
 *
 * @param projectRootPath The absolute path to the project root directory.
 *
 * @param resolvedExportPath The resolved export mapping containing the target source file pattern.
 *
 * @returns An Effect that yields the resolved source files mapping the export path to the found file relative paths.
 */
export const findSourceFiles = (
  projectRootPath: FullPath,
  resolvedExportPath: ResolvedPackageExport,
) =>
  Effect.gen(function* () {
    const service = yield* FileSearchService

    const fileInfoList = yield* service.search({
      parentDirectory: projectRootPath,
      includes: [toGloblPattern(resolvedExportPath.sourceFile)],
    })
    const exlucdeFile = resolvedExportPath.sourceFile.includes('/*/')
      ? join(projectRootPath, resolvedExportPath.sourceFile.replace('/*/', '/'))
      : ''
    const result: ResolvedSourceFile = {
      exportPath: resolvedExportPath.exportPath,
      sourceFiles: fileInfoList
        .filter((info) => info.isFile)
        .filter((info) => info.fullPath != exlucdeFile)
        .map((info) =>
          ProjectRelativePath(normalizePath(relative(projectRootPath, info.fullPath))),
        ),
    } satisfies ResolvedSourceFile
    return result
  })

const toGloblPattern = (pattern: string) => {
  return pattern.replace('/*/', '/**/')
}
