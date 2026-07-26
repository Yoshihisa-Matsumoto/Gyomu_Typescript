import type { ApprovalContext } from './ApprovalContext.js'
import type { Effect } from 'effect'
import type { ApprovalDecision } from '../model/ApprovalDecision.js'

/**
 * Represents the metadata associated with an approval policy, containing a unique identifier, display name, and optional description.
 */
export interface ApprovalPolicyMetadata {
  /**
   * The unique identifier of the approval policy.
   */
  readonly id: string

  /**
   * The display name of the approval policy.
   */
  readonly name: string

  /**
   * An optional description of the approval policy.
   */
  readonly description?: string
}

/**
 * Defines the contract for an approval policy that evaluates an input context to produce an approval decision.
 */
export interface ApprovalPolicy<TInput = unknown, TMetadata = unknown> {
  /**
   * The metadata defining the policy's identification and display information.
   */
  readonly metadata: ApprovalPolicyMetadata

  /**
   * Evaluates the provided approval context and returns an optional decision.
   *
   * @param context The contextual input and metadata used for evaluating the policy.
   *
   * @returns An effect that resolves to the approval decision, or undefined if no decision is made.
   */
  evaluate: (
    context: ApprovalContext<TInput, TMetadata>,
  ) => Effect.Effect<ApprovalDecision | undefined>
}
