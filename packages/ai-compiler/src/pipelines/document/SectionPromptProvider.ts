import { ModelRouteId } from '@gyomu/ai'
import type { IOError } from '@gyomu/schema'
import type { Message } from '@gyomu/schema/conversation'
import type { Effect } from 'effect'

export interface SectionPromptProvider<TSectionId extends string, TContext, R = never> {
  render: (sectionId: TSectionId, context: TContext) => Effect.Effect<Array<Message>, IOError, R>
}

export const DocumentSectionRouteId = ModelRouteId('readme-section')
