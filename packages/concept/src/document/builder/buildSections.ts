import { Effect } from 'effect'
import type { AiModelRoute, ModelRoutes } from '@gyomu/ai'
import type { DocumentBuilderError } from '../../error/DocumentBuilderError.js'
import type { FileSystem } from 'effect'
import type { Section } from '@gyomu/schema/schemas/document'
import type { SectionBuilder } from './SectionBuilder.js'
import type { DocumentBaseContext } from '@gyomu/schema/concept'

/**
 * Executes a collection of section builders in sequence to generate document sections, filtering out any builders that are disabled for the given context.
 *
 * @param context The document generation context used to determine builder enablement and build parameters.
 *
 * @param builders The sequence of section builders to execute.
 *
 * @returns An Effect that evaluates to a read-only array of successfully generated sections. Requires AiModelRoute, ModelRoutes, and FileSystem capabilities, and may fail with a DocumentBuilderError.
 */
export const buildSections = <TSectionId extends string, TContext extends DocumentBaseContext>(
  context: TContext,
  builders: ReadonlyArray<SectionBuilder<TSectionId, TContext, any>>,
): Effect.Effect<
  ReadonlyArray<Section>,
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

        return yield* builder.build(context)
      }),
    { concurrency: 1 },
  ).pipe(
    Effect.map((sections) =>
      sections.filter((section): section is Section => section !== undefined),
    ),
  )
