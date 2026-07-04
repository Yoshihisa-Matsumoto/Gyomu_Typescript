import type { HumanEditContext, HumanEditSignal } from '@gyomu/schema/schemas/typescript'

export const createHumanEditSignal = (
  type: HumanEditSignal['type'],
  pattern: string,
  context: HumanEditContext,
): HumanEditSignal => {
  const targetSection = getTargetSection(context)

  return {
    type,
    score: 0.6,
    details: {
      pattern,
      source: context.source,
      targetSection,
    },
  }
}

const getTargetSection = (context: HumanEditContext) => {
  if (context.tagName) return `tag:${context.tagName}`

  switch (context.source) {
    case 'summary':
      return context.source
    case 'example':
    case 'remarks':
      return `tag:${context.source}`
    default:
      return `tag:${context.tagName ?? ''}`
  }
}
