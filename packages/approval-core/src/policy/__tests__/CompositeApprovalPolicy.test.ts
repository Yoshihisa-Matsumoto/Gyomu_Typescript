import { Effect } from 'effect'
import { describe, expect, it } from 'vitest'
import { CompositeApprovalPolicy } from '../CompositeApprovalPolicy.js'
import type {
  ApprovalDecision,
  DeniedDecision,
  RequiresApprovalDecision,
} from '../../model/ApprovalDecision.js'
import type { ApprovalRule } from '../ApprovalRule.js'

const createRule = (decision: ApprovalDecision): ApprovalRule => ({
  evaluate: () => Effect.succeed(decision),
})

const requiresApproval: RequiresApprovalDecision = {
  type: 'requires-approval',
  findings: [
    {
      policyId: 'prod',
      policyName: 'Production',
      decision: 'requires-approval',
    },
  ],
}

const denied: DeniedDecision = {
  type: 'denied',
  findings: [
    {
      policyId: 'network',
      policyName: 'Network',
      decision: 'denied',
    },
  ],
}

describe('CompositeApprovalPolicy', () => {
  const context = {} as never

  it('returns undefined when no rule matches', async () => {
    const policy = new CompositeApprovalPolicy(
      { id: 'dfaf', name: 'test empty', description: 'test empty' },
      [],
    )

    const result = await Effect.runPromise(policy.evaluate(context))

    expect(result).toBeUndefined()
  })

  it('returns requires approval when one rule requires approval', async () => {
    const policy = new CompositeApprovalPolicy(
      { id: 'dfaf', name: 'require approval', description: 'require approval' },
      [createRule(requiresApproval)],
    )

    const result = await Effect.runPromise(policy.evaluate(context))

    expect(result).toEqual(requiresApproval)
  })

  it('merges multiple requires approval decisions', async () => {
    const policy = new CompositeApprovalPolicy(
      {
        id: 'dfaf',
        name: 'multiple requires approval decisions',
        description: 'multiple requires approval decisions',
      },
      [
        createRule(requiresApproval),
        createRule({
          type: 'requires-approval',
          findings: [
            {
              policyId: 'otp',
              policyName: 'OTP',
              decision: 'requires-approval',
            },
          ],
        }),
      ],
    )

    const result = await Effect.runPromise(policy.evaluate(context))

    expect(result?.type).toBe('requires-approval')

    expect(result?.findings).toHaveLength(2)
  })

  it('returns denied when denied exists', async () => {
    const policy = new CompositeApprovalPolicy(
      {
        id: 'dfaf',
        name: 'denied when denied exists',
        description: 'denied when denied exists',
      },
      [createRule(requiresApproval), createRule(denied)],
    )

    const result = await Effect.runPromise(policy.evaluate(context))

    expect(result?.type).toBe('denied')

    expect(result?.findings).toHaveLength(1)
  })
})
