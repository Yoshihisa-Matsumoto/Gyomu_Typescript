import type { Effect } from 'effect'
import type { ApprovalDecision } from '../model/ApprovalDecision.js'
import type { ApprovalContext } from './ApprovalContext.js'

export interface ApprovalRule<TInput = unknown, TMetadata = unknown> {
  evaluate: (
    context: ApprovalContext<TInput, TMetadata>,
  ) => Effect.Effect<ApprovalDecision | undefined>
}
