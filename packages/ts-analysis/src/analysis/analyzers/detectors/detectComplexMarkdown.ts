import { createHumanEditSignal } from './createHumanEditSignal.js'
import type { HumanEditContext, HumanEditSignal } from '@gyomu/schema/schemas/typescript'
import type { TextHumanEditDetector } from './types.js'

/**
 * Detects complex Markdown patterns such as headers or code blocks within the provided text.
 *
 * @param text The text content to analyze for Markdown patterns.
 *
 * @param context The context in which the text is being edited.
 *
 * @returns An array of detected human edit signals related to complex Markdown.
 */
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
