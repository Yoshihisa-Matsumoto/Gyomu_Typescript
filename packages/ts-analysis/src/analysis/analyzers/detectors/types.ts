import type { HumanEditContext, HumanEditSignal, ParsedTag } from '@gyomu/schema/schemas/typescript'

type HumanEditDetector<T> = (target: T, context: HumanEditContext) => Array<HumanEditSignal>

/**
 * A specialized HumanEditDetector for text string content.
 */
export type TextHumanEditDetector = HumanEditDetector<string>

/**
 * A specialized HumanEditDetector for parsed tag information.
 */
export type TagHumanEditDetector = HumanEditDetector<ParsedTag>
