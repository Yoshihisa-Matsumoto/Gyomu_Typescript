import type { ApprovalChallenge } from './ApprovalChallenge.js'

/**
 * Represents the outcome of a single approval policy check.
 */
export interface ApprovalFinding {
  /**
   * The unique identifier of the approval policy.
   */
  readonly policyId: string

  /**
   * The human-readable name of the approval policy.
   */
  readonly policyName: string

  /**
   * The outcome of the policy evaluation.
   */
  readonly decision: 'approved' | 'requires-approval' | 'denied'

  /**
   * An optional explanation for the policy decision.
   */
  readonly reason?: string

  /**
   * Optional list of challenges associated with the policy findings.
   */
  readonly challenges?: ReadonlyArray<ApprovalChallenge>
}

/**
 * Represents a decision result that requires further manual or automated approval.
 */
export interface RequiresApprovalDecision {
  /**
   * The discriminator for this decision type.
   */
  readonly type: 'requires-approval'

  /**
   * The list of findings requiring further approval.
   */
  readonly findings: ReadonlyArray<ApprovalFinding>
}

/**
 * Represents a decision result that has been denied by one or more policies.
 */
export interface DeniedDecision {
  /**
   * The discriminator for this decision type.
   */
  readonly type: 'denied'

  /**
   * The list of findings that resulted in denial.
   */
  readonly findings: ReadonlyArray<ApprovalFinding>
}

/**
 * A union type representing the possible final outcomes of an approval evaluation, which is either 'requires-approval' or 'denied'.
 */
export type ApprovalDecision = RequiresApprovalDecision | DeniedDecision
