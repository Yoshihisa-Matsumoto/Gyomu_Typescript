import { withOptional } from '@gyomu/schema'
import type { HumanEditContext, HumanEditSignal } from '@gyomu/schema/typescript'

export const createHumanEditSignal = (
  type: HumanEditSignal['type'],
  pattern: string,
  context: HumanEditContext,
): HumanEditSignal => ({
  type,
  score: 0.6,
  details: { pattern, source: context.source, ...withOptional({ tagName: context.tagName }) },
})
