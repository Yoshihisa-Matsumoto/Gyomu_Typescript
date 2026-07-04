import { createHumanEditSignal } from './createHumanEditSignal.js'
import type { HumanEditContext, HumanEditSignal } from '@gyomu/schema/schemas/typescript'
import type { TextHumanEditDetector } from './types.js'

export const detectManualFormatting: TextHumanEditDetector = (
  text: string,
  context: HumanEditContext,
): Array<HumanEditSignal> => {
  const signals: Array<HumanEditSignal> = []

  const alignedSpacing = /\S {2,}\S/.test(text)
  if (alignedSpacing) signals.push(createHumanEditSignal('manual-format', `aligned space`, context))

  for (const line of text.split('\n')) {
    if (line.trim().length === 0) {
      continue
    }
    const symbolCount = line.match(/[│┌└─═║╔╗╝╚>~`^]/g)?.length ?? 0
    const symbolRatio = symbolCount / line.length
    if (symbolRatio > 0.3)
      signals.push(createHumanEditSignal('manual-format', `ascii-art`, context))
  }

  const indentation = /^\s{4,}\S/m.test(text)
  if (indentation) signals.push(createHumanEditSignal('manual-format', `indentation`, context))

  const decorativeSeparator = /^([-=*_])\1{4,}$/m.test(text)
  if (decorativeSeparator)
    signals.push(createHumanEditSignal('manual-format', 'decorative separators', context))

  return signals
}
