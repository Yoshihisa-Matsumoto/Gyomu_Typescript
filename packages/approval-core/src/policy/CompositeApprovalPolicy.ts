import { Array, Effect } from 'effect'
import type { ApprovalPolicy, ApprovalPolicyMetadata } from './ApprovalPoilicy.js'
import type { ApprovalRule } from './ApprovalRule.js'
import type { ApprovalContext } from './ApprovalContext.js'
import type {
  ApprovalDecision,
  DeniedDecision,
  RequiresApprovalDecision,
} from '../model/ApprovalDecision.js'

export class CompositeApprovalPolicy<
  TInput = unknown,
  TMetadata = unknown,
> implements ApprovalPolicy<TInput, TMetadata> {
  constructor(
    readonly metadata: ApprovalPolicyMetadata,
    private readonly rules: ReadonlyArray<ApprovalRule<TInput, TMetadata>>,
  ) {}

  evaluate(context: ApprovalContext<TInput, TMetadata>) {
    const rules = this.rules

    return Effect.gen(function* () {
      const decisions = yield* Effect.forEach(rules, (rule) => rule.evaluate(context))

      const activeDecisions = decisions.filter((x): x is ApprovalDecision => x !== undefined)

      const denied = activeDecisions.filter((x) => x.type === 'denied')

      if (Array.isArrayNonEmpty(denied)) {
        return mergeDecision(denied)
      }

      const requiresApproval = activeDecisions.filter((x) => x.type === 'requires-approval')

      if (Array.isArrayNonEmpty(requiresApproval)) {
        return mergeDecision(requiresApproval)
      }

      return undefined
    })
  }
}

export function mergeDecision(
  decisions: Array.NonEmptyReadonlyArray<DeniedDecision>,
): DeniedDecision

export function mergeDecision(
  decisions: Array.NonEmptyReadonlyArray<RequiresApprovalDecision>,
): RequiresApprovalDecision

export function mergeDecision(
  decisions: Array.NonEmptyReadonlyArray<ApprovalDecision>,
): ApprovalDecision {
  return {
    type: decisions[0].type,
    findings: decisions.flatMap((decision) => decision.findings),
  }
}
