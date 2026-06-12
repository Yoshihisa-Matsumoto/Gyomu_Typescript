import { createHumanEditSignal } from './createHumanEditSignal.js'
import type { HumanEditContext, HumanEditSignal } from '@gyomu/schema/typescript'
import type { TextHumanEditDetector } from './types.js'

export const detectComplexMarkdown: TextHumanEditDetector = (
  text: string,
  context: HumanEditContext,
): Array<HumanEditSignal> => {
  const signals: Array<HumanEditSignal> = []
  if (text) {
    // パターン1: 行頭に # があるか（前に空白は許可）
    const startsWithHash = /^\s*#{1,6}\s+/m.test(text)
    if (startsWithHash)
      signals.push(createHumanEditSignal('complex-markdown', 'start with #', context))

    // パターン2: ``` を含むか
    const hasCodeFence = /^\s*```/m.test(text)
    if (hasCodeFence) signals.push(createHumanEditSignal('complex-markdown', '```', context))
  }
  return signals
}
