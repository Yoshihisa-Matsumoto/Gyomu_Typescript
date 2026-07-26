import { join } from 'node:path'
import { Effect } from 'effect'
import { SupportedTranslationLanguages } from '@gyomu/schema/schemas/document'
import { writeStringToFile } from '@gyomu/infra/fs'
import { wrapInfraError } from '@gyomu/schema'
import { DocumentBuilderError } from '../error/DocumentBuilderError.js'
import { initializeReadmeBuildContext } from './initializeReadmeBuildContext.js'
import { buildReadmeSections } from './builder/buildReadmeSections.js'
import { collectTransationTargets } from './translation/collectTranslationTargets.js'
import { createTranslationPlan } from './translation/createTranslationPlan.js'
import { translate } from './translation/translate.js'
import { applyTranslations } from './translation/applyTranslations.js'
import { renderMarkdown } from './render/renderMarkdown.js'
import { getReadmeFileName } from './internal/getReadmeFileName.js'
import type { AiModelRoute, ModelRoutes } from '@gyomu/ai'
import type { ProjectContext } from '@gyomu/ts-analysis'
import type { ConceptOptions } from '../ConceptOptions.js'
import type { FileSystem } from 'effect/FileSystem'
import type { FileSearchService } from '@gyomu/schema/shared/fs'

export const generateReadmeFiles = (
  project: ProjectContext,
  option?: ConceptOptions,
): Effect.Effect<
  void,
  DocumentBuilderError,
  AiModelRoute | FileSystem | ModelRoutes | FileSearchService
> =>
  Effect.gen(function* () {
    const projectRootPath = project.projectRoot
    const context = yield* initializeReadmeBuildContext(project, option)

    const sections = yield* buildReadmeSections(context)

    const translationTargets = collectTransationTargets(sections)

    const plans = SupportedTranslationLanguages.map((language) =>
      createTranslationPlan(language, translationTargets, sections),
    )

    yield* Effect.forEach(plans, (plan) =>
      Effect.gen(function* () {
        const translationResult = yield* translate(context, plan.language, plan.targets)
        yield* applyTranslations(context, plan, translationResult)
        const markdown = renderMarkdown(context, plan, true)
        const readmeFilename = getReadmeFileName(plan.language)

        const readmeFilePath = join(projectRootPath, readmeFilename)
        yield* writeStringToFile(readmeFilePath, markdown).pipe(
          Effect.mapError((e) =>
            wrapInfraError(DocumentBuilderError, e, () => ({
              filePath: readmeFilePath,
              packageName: context.analysis.package.name,
              phase: 'export' as const,
              message: 'fail to write README',
            })),
          ),
        )
      }),
    )
  })
