import { Effect } from 'effect'
import { createBuiltSection } from './createBuiltSection.js'
import type { BuiltSection } from '@gyomu/schema/document'
import type { ConceptOptions } from '../../ConceptOptions.js'
import type { AiModelRoute, ModelRoutes } from '@gyomu/ai'
import type { DocumentBuilderError } from '../../error/DocumentBuilderError.js'
import type { FileSystem } from 'effect'
import type { SectionBuilder } from './SectionBuilder.js'
import type { DocumentBaseContext } from '@gyomu/schema/concept'

/**
 * Executes a collection of section builders in sequence to generate document sections, filtering out any builders that are disabled for the given context.
 *
 * @param context The document generation context used to determine builder enablement and build parameters.
 *
 * @param builders The sequence of section builders to execute.
 *
 * @param option Optional configuration for the concept generation.
 *
 * @returns An Effect that evaluates to a read-only array of successfully generated sections. Requires AiModelRoute, ModelRoutes, and FileSystem capabilities, and may fail with a DocumentBuilderError.
 */
export const buildSections = <TSectionId extends string, TContext extends DocumentBaseContext>(
  context: TContext,
  builders: ReadonlyArray<SectionBuilder<TSectionId, TContext, any>>,
  option?: ConceptOptions,
): Effect.Effect<
  ReadonlyArray<BuiltSection>,
  DocumentBuilderError,
  AiModelRoute | ModelRoutes | FileSystem.FileSystem
> =>
  Effect.forEach(
    builders,
    (builder) =>
      Effect.gen(function* () {
        const enabled = builder.enabled(context)

        if (!enabled) {
          return undefined
        }
        const sectionWithInstruction = yield* builder.build(context, option)

        return createBuiltSection(sectionWithInstruction, builder.translation)
      }),
    { concurrency: 1 },
  ).pipe(
    Effect.map((sections) =>
      sections.filter((section): section is BuiltSection => section !== undefined),
    ),
  )
