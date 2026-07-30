import { join } from 'node:path'
import { Effect } from 'effect'
import { SupportedTranslationLanguages } from '@gyomu/schema/schemas/document'
import { writeStringToFile } from '@gyomu/infra/fs'
import { wrapInfraError } from '@gyomu/schema'
import { DocumentBuilderError } from '../error/DocumentBuilderError.js'
import { buildSections } from '../document/builder/buildSections.js'
import { collectTransationTargets } from '../document/translation/collectTranslationTargets.js'
import { createTranslationPlan } from '../document/translation/createTranslationPlan.js'
import { applyTranslations } from '../document/translation/applyTranslations.js'
import { translateReadme } from './translation/translateReadme.js'
import { initializeReadmeBuildContext } from './initializeReadmeBuildContext.js'
import { renderReadmeMarkdown } from './render/renderReadmeMarkdown.js'
import { getReadmeFileName } from './internal/getReadmeFileName.js'
import { README_SECTION_BUILDERS } from './builder/builder.js'
import type { AiModelRoute, ModelRoutes } from '@gyomu/ai'
import type { ProjectContext } from '@gyomu/ts-analysis'
import type { ConceptOptions } from '../ConceptOptions.js'
import type { FileSystem } from 'effect/FileSystem'
import type { FileSearchService } from '@gyomu/schema/shared/fs'

/**
 * Generates README files for a project across multiple supported languages.
 *
 * @param project The project context containing root paths and configuration.
 *
 * @param option Optional configuration for README generation.
 *
 * @returns An effect that generates localized README files. Requires AiModelRoute, FileSystem, ModelRoutes, and FileSearchService to execute. Fails with DocumentBuilderError.
 */
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

    const sections = yield* buildSections(context, README_SECTION_BUILDERS, option)
    if (option?.debugInfo?.ReadmeSections) {
      if (option.debugInfo.DumpToFile)
        yield* writeStringToFile(
          './log/ReadmeSections.txt',
          JSON.stringify(sections, null, 2),
        ).pipe(Effect.catch(() => Effect.succeed(undefined)))
      else console.dir(sections, { depth: null })
    }

    const translationTargets = collectTransationTargets(sections)

    const plans = SupportedTranslationLanguages.map((language) =>
      createTranslationPlan(language, translationTargets, sections),
    )

    yield* Effect.forEach(plans, (plan) =>
      Effect.gen(function* () {
        const translationResult = yield* translateReadme(context, plan.language, plan.targets)
        yield* applyTranslations(context, plan, translationResult)
        const markdown = renderReadmeMarkdown(context, plan, true)
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
