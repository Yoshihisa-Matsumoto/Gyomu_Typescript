import type { HumanEditContext, HumanEditSignal, ParsedTag } from '@gyomu/schema/schemas/typescript'

type HumanEditDetector<T> = (target: T, context: HumanEditContext) => Array<HumanEditSignal>

export type TextHumanEditDetector = HumanEditDetector<string>
export type TagHumanEditDetector = HumanEditDetector<ParsedTag>
