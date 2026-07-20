import { detectNonGeneratedTag } from './detectors/detectNonGeneratedTag.js'
import { detectComplexMarkdown } from './detectors/detectComplexMarkdown.js'
import { detectManualFormatting } from './detectors/detectManualFormatting.js'
import type { HumanEditSignal, ParsedJsDoc } from '@gyomu/schema/schemas/typescript'

export const analyzeHumanEditSignals = (parsed: ParsedJsDoc): Array<HumanEditSignal> => {
  const signals: Array<HumanEditSignal> = []

  if (parsed.summary) {
    signals.push(...detectComplexMarkdown(parsed.summary, { source: 'summary' }))
    signals.push(...detectManualFormatting(parsed.summary, { source: 'summary' }))
  }

  if (parsed.remarks) {
    signals.push(...detectComplexMarkdown(parsed.remarks, { source: 'remarks' }))
    signals.push(...detectManualFormatting(parsed.remarks, { source: 'remarks' }))
  }

  for (const example of parsed.examples) {
    signals.push(...detectComplexMarkdown(example, { source: 'example' }))
    signals.push(...detectManualFormatting(example, { source: 'example' }))
  }

  for (const tag of parsed.tags) {
    const nonGenerated = detectNonGeneratedTag(tag, { source: 'tag' })
    signals.push(...nonGenerated)

    if (tag.text) {
      signals.push(...detectComplexMarkdown(tag.text, { source: 'tag', tagName: tag.tagName }))
      signals.push(...detectManualFormatting(tag.text, { source: 'tag', tagName: tag.tagName }))
    }
  }

  for (const example of parsed.examples) {
    if (example.length > 500)
      signals.push({
        type: 'custom-example',
        score: 0.8,
        details: { targetSection: 'tag:example' },
      })
  }

  return signals
}
