import type { HumanEditContext, HumanEditSignal } from '@gyomu/schema/schemas/typescript'

/**
 * Creates a human edit signal with the specified type, pattern, and context.
 *
 * @param type The category or type of the detected edit.
 *
 * @param pattern The specific pattern identified as a human edit.
 *
 * @param context The context object providing details about the source file and target section.
 *
 * @returns A constructed HumanEditSignal object.
 */
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
