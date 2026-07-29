import { Effect } from 'effect'
import type { AiModelRoute, ModelRoutes } from '@gyomu/ai'
import type { DocumentBuilderError } from '../../error/DocumentBuilderError.js'
import type { FileSystem } from 'effect'
import type { Section } from '@gyomu/schema/schemas/document'
import type { SectionBuilder } from './SectionBuilder.js'
import type { DocumentBaseContext } from '@gyomu/schema/concept'

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
