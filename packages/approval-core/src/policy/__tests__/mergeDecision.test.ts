import { describe, expect, it } from 'vitest'
import { mergeDecision } from '../CompositeApprovalPolicy.js'
import type { DeniedDecision, RequiresApprovalDecision } from '../../model/ApprovalDecision.js'

const denied1: DeniedDecision = {
  type: 'denied',
  findings: [
    {
      policyId: 'network',
      policyName: 'Network',
      decision: 'denied',
    },
  ],
}
const denied2: DeniedDecision = {
  type: 'denied',
  findings: [
    {
      policyId: 'tokyo',
      policyName: 'Tokyo',
      decision: 'denied',
    },
  ],
}

const requires1: RequiresApprovalDecision = {
  type: 'requires-approval',
  findings: [
    {
      policyId: 'prod',
      policyName: 'Production',
      decision: 'requires-approval',
    },
  ],
}

const requires2: RequiresApprovalDecision = {
  type: 'requires-approval',
  findings: [
    {
      policyId: 'prod2',
      policyName: 'Production2',
      decision: 'requires-approval',
    },
  ],
}
describe('mergeDecision', () => {
  it('merges denied findings', () => {
    const result = mergeDecision([denied1, denied2])

    expect(result.type).toBe('denied')
    expect(result.findings).toEqual([...denied1.findings, ...denied2.findings])
  })

  it('merges requires approval findings', () => {
    const result = mergeDecision([requires1, requires2])

    expect(result.type).toBe('requires-approval')

    expect(result.findings).toEqual([...requires1.findings, ...requires2.findings])
  })
})
