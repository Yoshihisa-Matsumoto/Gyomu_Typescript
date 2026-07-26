import { Effect } from 'effect'
import { buildSectionItem } from '@gyomu/ai-compiler/readme'
import { wrapInfraError } from '@gyomu/schema'
import { DocumentBuilderError } from '../../../error/DocumentBuilderError.js'
import type { FileSystem } from 'effect'
import type { Section } from '@gyomu/schema/schemas/document'
import type { ReadmeBuildContext } from '@gyomu/schema/concept'
import type { ReadmeSectionBuilder } from '../ReadmeSectionBuilder.js'
import type { AiModelRoute, ModelRoutes } from '@gyomu/ai'

export const buildDevelopment: ReadmeSectionBuilder<
  AiModelRoute | FileSystem.FileSystem | ModelRoutes
> = {
  id: 'development',

  build: (context: ReadmeBuildContext) =>
    Effect.gen(function* () {
      const developmentResult = yield* buildSectionItem('development', context)
      return {
        id: 'development',
        title: undefined,
        contents: [
          {
            type: 'paragraph',
            text: developmentResult,
          },
        ],
      } satisfies Section
    }).pipe(
      Effect.mapError((e) =>
        wrapInfraError(DocumentBuilderError, e, (e) => ({
          filePath: 'README.md',
          packageName: context.analysis.package.name,
          phase: 'section-build' as const,
          sectionId: 'dependencies',
          cause: e,
        })),
      ),
    ),

  enabled: () => true,
}
