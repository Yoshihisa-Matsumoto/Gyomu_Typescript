import type { HumanEditSignal, ParsedTag } from '../../jsdoc/ParsedJsDoc.js'
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
export const detectNonGeneratedTag: TagHumanEditDetector = (
  tag: ParsedTag,
): Array<HumanEditSignal> => {
  if (!knownTags.has(tag.tagName))
    return [{ type: 'non-generated-tag', score: 0.4, details: { tagName: tag.tagName } }]

  return []
}
