import { Effect } from 'effect'
import { README_SECTION_BUILDERS } from './builder.js'
import type { DocumentBuilderError } from '../../error/DocumentBuilderError.js'

import type { ReadmeBuildContext } from '@gyomu/schema/concept'
import type { Section } from '@gyomu/schema/schemas/document'
import type { AiModelRoute, ModelRoutes } from '@gyomu/ai'
import type { FileSystem } from 'effect'

export const buildReadmeSections = (
  context: ReadmeBuildContext,
  builders = README_SECTION_BUILDERS,
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
