import { ModelRouteId } from '@gyomu/ai'
import type { IOError } from '@gyomu/schema'
import type { Message } from '@gyomu/schema/conversation'
import type { Effect } from 'effect'

/**
 * Provides a prompt rendering interface for specific sections using a given context, returning an Effect that yields messages or fails with an IOError.
 */
export interface SectionPromptProvider<TSectionId extends string, TContext, R = never> {
  /**
   * Renders prompts for the specified section identifier and context.
   *
   * @param sectionId The identifier of the section to render.
   *
   * @param context The context used during rendering.
   *
   * @returns An Effect yielding an array of messages, or failing with an IOError.
   */
  render: (sectionId: TSectionId, context: TContext) => Effect.Effect<Array<Message>, IOError, R>
}

/**
 * Route identifier for document sections.
 */
export const DocumentSectionRouteId = ModelRouteId('readme-section')
