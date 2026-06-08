import { Effect } from 'effect'
import { readStringFromFile, writeStringToFile } from '@gyomu/infra/fs'
import { analyzeFile } from '../analysis/analyzeFile.js'
import { toProjectAbsolutePath } from '../shared/index.js'
import { buildMergePlan } from './buildMergePlan.js'
import { applyMergePlans } from './applyMergePlan.js'
import { buildFileUpdatePlan } from './buildFileUpdatePlan.js'
import { renderJsDocs } from './renderJsDoc.js'
import { applyFileUpdatePlan } from './applyFileUpdatePlan.js'
import { UpdateError } from './error/UpdateError.js'
import type { ProjectRelativePath } from '../analysis/types.js'
import type { ProjectContext } from '../analysis/project/ProjectContext.js'
import type { AnalysisOptions } from '../analysis/AnalysisOption.js'

export const processTsDocUpdate = (
  context: ProjectContext,
  /**
   * Path accepted by {@link Project.getSourceFile}.
   */
  sourceFilePath: ProjectRelativePath,
  option?: AnalysisOptions,
) => {
  return Effect.gen(function* () {
    const fileResult = yield* analyzeFile(context, sourceFilePath, option)
    // console.dir(result, { depth: null })

    const mergePlans = yield* buildMergePlan(context.projectName, fileResult)

    console.dir(fileResult.metadata.symbols.keys())
    const updateJsDocs = yield* applyMergePlans(fileResult, mergePlans)

    const renderedJsDocs = renderJsDocs(updateJsDocs)
    console.dir(renderedJsDocs, { depth: null })
    const fileUpdatePlan = buildFileUpdatePlan(fileResult, renderedJsDocs)
    console.dir(fileUpdatePlan, { depth: null })
    const sourceFileAbsolutePath = toProjectAbsolutePath(sourceFilePath, context.projectRoot)

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
