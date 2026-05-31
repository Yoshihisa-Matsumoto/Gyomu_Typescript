import type { HumanEditContext, HumanEditSignal, ParsedTag } from '../../jsdoc/ParsedJsDoc.js'

type HumanEditDetector<T> = (target: T, context: HumanEditContext) => Array<HumanEditSignal>

export type TextHumanEditDetector = HumanEditDetector<string>
export type TagHumanEditDetector = HumanEditDetector<ParsedTag>
