import type { ApprovalContext } from './ApprovalContext.js'
import type { Effect } from 'effect'
import type { ApprovalDecision } from '../model/ApprovalDecision.js'

export interface ApprovalPolicyMetadata {
  readonly id: string

  readonly name: string

  readonly description?: string
}

export interface ApprovalPolicy<TInput = unknown, TMetadata = unknown> {
  readonly metadata: ApprovalPolicyMetadata
  evaluate: (
    context: ApprovalContext<TInput, TMetadata>,
  ) => Effect.Effect<ApprovalDecision | undefined>
}
