import type { ApprovalChallenge } from './ApprovalChallenge.js'

export interface ApprovalFinding {
  readonly policyId: string

  readonly policyName: string

  readonly decision: 'approved' | 'requires-approval' | 'denied'

  readonly reason?: string

  readonly challenges?: ReadonlyArray<ApprovalChallenge>
}

export interface RequiresApprovalDecision {
  readonly type: 'requires-approval'

  readonly findings: ReadonlyArray<ApprovalFinding>
}

export interface DeniedDecision {
  readonly type: 'denied'

  readonly findings: ReadonlyArray<ApprovalFinding>
}

export type ApprovalDecision = RequiresApprovalDecision | DeniedDecision
