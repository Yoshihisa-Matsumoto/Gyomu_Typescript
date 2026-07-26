import type { Section } from '@gyomu/schema/schemas/document'
import type { ReadmeBuildContext, ReadmeSectionId } from '@gyomu/schema/concept'

import type { Effect } from 'effect'
import type { DocumentBuilderError } from '../../error/DocumentBuilderError.js'

/**
 * Defines a builder for generating documentation sections within a generated README.
 */
export interface ReadmeSectionBuilder<R = never> {
  /**
   * The unique identifier for the README section.
   */
  readonly id: ReadmeSectionId

  /**
   * Constructs the documentation section based on the provided build context.
   *
   * @returns An effect that resolves to the generated Section, requiring context R and potentially failing with DocumentBuilderError.
   */
  build: (context: ReadmeBuildContext) => Effect.Effect<Section, DocumentBuilderError, R>

  /**
   * Checks whether the section is enabled for the current build context.
   *
   * @returns True if the section should be included in the README, false otherwise.
   */
  readonly enabled: (context: ReadmeBuildContext) => boolean
}
