import { Array, Effect } from 'effect'
import type { ApprovalPolicy, ApprovalPolicyMetadata } from './ApprovalPoilicy.js'
import type { ApprovalRule } from './ApprovalRule.js'
import type { ApprovalContext } from './ApprovalContext.js'
import type {
  ApprovalDecision,
  DeniedDecision,
  RequiresApprovalDecision,
} from '../model/ApprovalDecision.js'

/**
 * An approval policy that aggregates multiple approval rules.
 */
export class CompositeApprovalPolicy<
  TInput = unknown,
  TMetadata = unknown,
> implements ApprovalPolicy<TInput, TMetadata> {
  /**
   * Initializes a new CompositeApprovalPolicy instance.
   *
   * @param metadata The metadata associated with this policy.
   *
   * @param rules The collection of approval rules to evaluate.
   */
  constructor(
    readonly metadata: ApprovalPolicyMetadata,
    private readonly rules: ReadonlyArray<ApprovalRule<TInput, TMetadata>>,
  ) {}

  /**
   * Evaluates all rules within the given context and returns the merged decision.
   *
   * @param context The approval context containing input and metadata for evaluation.
   *
   * @returns An Effect that evaluates to a decision if any rule triggers it, or undefined.
   */
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

/**
 * Merges multiple denied decisions into a single result.
 *
 * @param decisions A non-empty list of denied decisions to merge.
 *
 * @returns The aggregated denied decision.
 */
export function mergeDecision(
  decisions: Array.NonEmptyReadonlyArray<DeniedDecision>,
): DeniedDecision

/**
 * Merges multiple requires-approval decisions into a single result.
 *
 * @param decisions A non-empty list of requires-approval decisions to merge.
 *
 * @returns The aggregated requires-approval decision.
 */
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
