import { Effect } from 'effect'
import { writeStringToFile } from '@gyomu/infra/fs'
import { wrapInfraError } from '@gyomu/schema'
import { DocumentBuilderError } from '../error/DocumentBuilderError.js'
import { translateSection } from './translation/translateSection.js'
import { buildSections } from './builder/buildSections.js'
import type { FileSearchService } from '@gyomu/schema/shared/fs'
import type { AiModelRoute, ModelRoutes } from '@gyomu/ai'
import type { FileSystem } from 'effect'
import type { ProjectContext } from '@gyomu/ts-analysis'
import type { ConceptOptions } from '../ConceptOptions.js'
import type { DocumentDefinition } from './DocumentDefinition.js'
import type { DocumentBaseContext } from '@gyomu/schema/concept'
import type { TranslatedDocument } from './translation/TranslatedDocument.js'

/**
 * Generates a multi-language documentation project based on the provided definition and project context.
 *
 * @param definition The document definition containing section builders, renderers, and language settings.
 *
 * @param project The project-specific context required for documentation generation.
 *
 * @param option Optional configuration settings for the documentation generation process.
 *
 * @returns An Effect that completes when the document generation process finishes, or fails with a DocumentBuilderError.
 *
 * @requires AiModelRoute, FileSystem, ModelRoutes, and FileSearchService.
 */
export const generateDocument = <
  TSectionId extends string,
  TContext extends DocumentBaseContext,
  TOptions extends ConceptOptions,
  TRendererOptions,
>(
  definition: DocumentDefinition<TSectionId, TContext, TOptions, TRendererOptions>,
  project: ProjectContext,
  option?: TOptions,
): Effect.Effect<
  void,
  DocumentBuilderError,
  AiModelRoute | FileSystem.FileSystem | ModelRoutes | FileSearchService
> =>
  Effect.gen(function* () {
    const context = yield* definition.createContext(project, option)

    const sections = yield* buildSections(context, definition.sectionBuilders, option)
    if (option?.debugInfo?.ReadmeSections) {
      if (option.debugInfo.DumpToFile)
        yield* writeStringToFile(
          './log/ReadmeSections.txt',
          JSON.stringify(sections, null, 2),
        ).pipe(Effect.catch(() => Effect.succeed(undefined)))
      else console.dir(sections, { depth: null })
    }

    yield* Effect.forEach(definition.supportedLanguages, (language) =>
      Effect.gen(function* () {
        const translatedSections = yield* Effect.forEach(sections, (section) =>
          translateSection(section, language, option).pipe(
            Effect.mapError((e) =>
              wrapInfraError(DocumentBuilderError, e, () => ({
                message: 'fail to translate section',
                phase: 'translate' as const,
                packageName: context.analysis.package.name,
                sectionId: section.section.id,
              })),
            ),
          ),
        )
        const translatedDocument: TranslatedDocument = {
          language,
          sections: translatedSections,
        }
        const renderOutput = yield* definition.output.renderer.render(
          context,
          translatedDocument,
          option,
          definition.rendererOptions,
        )

        const readmeFilePath = definition.output.filepathResolver.resolve(project, language)
        if (renderOutput.type == 'text')
          yield* writeStringToFile(readmeFilePath, renderOutput.content).pipe(
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
