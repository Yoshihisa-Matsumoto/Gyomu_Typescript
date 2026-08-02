import type { SectionWithInstruction } from '@gyomu/schema/document'
import type { ConceptOptions } from '../../ConceptOptions.js'
import type { DocumentBaseContext } from '@gyomu/schema/concept'
import type { Section } from '@gyomu/schema/schemas/document'
import type { Effect } from 'effect'
import type { DocumentBuilderError } from '../../error/DocumentBuilderError.js'

/**
 * Defines a builder for a documentation section, capable of constructing section content using a given context and requirement R.
 */
export interface SectionBuilder<
  TSectionId extends string,
  TContext extends DocumentBaseContext,
  R = never,
> {
  /**
   * The unique identifier for the section.
   */
  readonly id: TSectionId

  /**
   * Constructs the documentation section based on the provided build context.
   *
   * @returns An effect that resolves to the generated Section, requiring context R and potentially failing with DocumentBuilderError.
   */
  build: (
    context: TContext,
    option?: ConceptOptions,
  ) => Effect.Effect<SectionWithInstruction, DocumentBuilderError, R>

  /**
   * Checks whether the section is enabled for the current build context.
   *
   * @returns True if the section should be included in the document, false otherwise.
   */
  readonly enabled: (context: TContext) => boolean
}
