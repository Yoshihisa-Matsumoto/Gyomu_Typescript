import { Effect } from 'effect'
import { readStringFromFile, writeStringToFile } from '@gyomu/infra/fs'
import { toProjectAbsolutePath } from '../shared/index.js'
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
    const mergePlans = yield* buildMergePlan(context.projectName, fileResult, option)

    // console.dir(fileResult.metadata.symbols.keys())
    const updateJsDocs = yield* applyMergePlans(fileResult, mergePlans)

    const renderedJsDocs = renderJsDocs(updateJsDocs)
    if (option?.debugInfo?.RenderedSymbolJsDoc) console.dir(renderedJsDocs, { depth: null })
    const fileUpdatePlan = buildFileUpdatePlan(fileResult, renderedJsDocs)
    if (option?.debugInfo?.FileUpdatePlan) console.dir(fileUpdatePlan, { depth: null })
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

    yield* writeStringToFile(sourceFileAbsolutePath, tsUpdatedContent).pipe(
      Effect.mapError(
        (e) =>
          new UpdateError({
            cause: e,
            filePath: sourceFileAbsolutePath,
            message: 'fail to update sourcefile',
            phase: 'update',
          }),
      ),
    )
  })
}
