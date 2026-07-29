import type { HumanEditSignal, ParsedTag } from '@gyomu/schema/schemas/typescript'
import type { TagHumanEditDetector } from './types.js'

const knownTags = new Set([
  'param',
  'returns',
  'remarks',
  'example',
  'throws',
  'template',
  'deprecated',
  'GeneratedBy',
])

/**
 * Detects if a JSDoc tag is not part of the known set of auto-generated tags, signaling a potential manual edit.
 *
 * @param tag The parsed JSDoc tag to evaluate.
 *
 * @returns An array of human edit signals if the tag is unrecognized, otherwise an empty array.
 */
export const detectNonGeneratedTag: TagHumanEditDetector = (
  tag: ParsedTag,
): Array<HumanEditSignal> => {
  if (!knownTags.has(tag.tagName))
    return [
      {
        type: 'non-generated-tag',
        score: 0.4,
        details: { targetSection: `tag:${tag.tagName}` },
      },
    ]

  return []
}
