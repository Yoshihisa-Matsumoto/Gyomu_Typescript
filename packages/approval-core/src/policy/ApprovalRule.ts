import type { Effect } from 'effect'
import type { ApprovalDecision } from '../model/ApprovalDecision.js'
import type { ApprovalContext } from './ApprovalContext.js'

/**
 * Defines a rule for evaluating approvals based on a given context, potentially returning an approval decision.
 */
export interface ApprovalRule<TInput = unknown, TMetadata = unknown> {
  /**
   * Evaluates the approval rule against the provided context.
   *
   * @param context The evaluation context containing input data and metadata.
   *
   * @returns An effect yielding an approval decision, or undefined if no decision could be made.
   */
  evaluate: (
    context: ApprovalContext<TInput, TMetadata>,
  ) => Effect.Effect<ApprovalDecision | undefined>
}
