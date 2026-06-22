import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import { Effect } from 'effect'
import { makeDirectory, readStringFromFile, writeStringToFile } from '@gyomu/infra/fs'
import { toProjectAbsolutePath } from '../shared/index.js'
import { findWorkspaceRoot } from '../shared/path/findWorkspaceRoot.js'
import { buildMergePlan } from './buildMergePlan.js'
import { applyMergePlans } from './applyMergePlan.js'
import { buildFileUpdatePlan } from './buildFileUpdatePlan.js'
import { renderJsDocs } from './renderJsDoc.js'
import { applyFileUpdatePlan } from './applyFileUpdatePlan.js'
import { UpdateError } from './error/UpdateError.js'
import type { FileAnalysisResult } from '../analysis/file/FileAnalysisResult.js'
import type { ProjectContext } from '../analysis/project/ProjectContext.js'
import type { UpdateOptions } from './UpdateOptions.js'

export const processTsDocUpdate = (
  context: ProjectContext,
  fileResult: FileAnalysisResult,
  option?: UpdateOptions,
) => {
  return Effect.gen(function* () {
    if (fileResult.analysis.exports.length == 0) return
    const mergePlans = yield* buildMergePlan(context.projectName, fileResult, option)
    if (option?.action?.NoLLMRequest) {
      return
    }
    // console.dir(fileResult.metadata.symbols.keys())
    const updateJsDocs = yield* applyMergePlans(fileResult, mergePlans)

    const renderedJsDocs = renderJsDocs(updateJsDocs)
    if (option?.debugInfo?.RenderedSymbolJsDoc) {
      if (option.debugInfo.DumpToFile)
        yield* writeStringToFile('./log/RenderedJsDoc.txt', JSON.stringify(renderedJsDocs, null, 2))
      else console.dir(renderedJsDocs, { depth: null })
    }
    const fileUpdatePlan = buildFileUpdatePlan(fileResult, renderedJsDocs)
    if (option?.debugInfo?.FileUpdatePlan) {
      if (option.debugInfo.DumpToFile)
        yield* writeStringToFile(
          './log/FileUpdatePlan.txt',
          JSON.stringify(fileUpdatePlan, null, 2),
        )
      else console.dir(fileUpdatePlan, { depth: null })
    }
    const sourceFileAbsolutePath = toProjectAbsolutePath(
      fileResult.analysis.path,
      context.projectRoot,
    )

    const sourceContent = yield* readStringFromFile(sourceFileAbsolutePath).pipe(
      Effect.mapError(
        (e) =>
          new UpdateError({
            cause: e,
            filePath: sourceFileAbsolutePath,
            message: 'fail to read sourcefile',
            phase: 'update',
          }),
      ),
    )

    const tsUpdatedContent = applyFileUpdatePlan(sourceContent, fileUpdatePlan)

    if (option?.action?.NoUpdateTSDoc) {
      return
    }

    let destinationPath = sourceFileAbsolutePath
    if (option?.action?.WriteToTempFolder) {
      const rootPath = join(tmpdir(), 'tsdoc-temp')

      const repositoryRoot = yield* findWorkspaceRoot(context.projectRoot)

      const projectRelativePath = relative(repositoryRoot, context.projectRoot)

      const projectPath = join(rootPath, projectRelativePath)

      destinationPath = toProjectAbsolutePath(fileResult.analysis.path, projectPath)
      yield* makeDirectory(destinationPath, true)
    }

    yield* writeStringToFile(destinationPath, tsUpdatedContent).pipe(
      Effect.mapError(
        (e) =>
          new UpdateError({
            cause: e,
            filePath: destinationPath,
            message: 'fail to update sourcefile',
            phase: 'update',
          }),
      ),
    )
  })
}
