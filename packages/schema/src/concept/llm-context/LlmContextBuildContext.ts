import type { CodingGuideline } from '../../schemas/knowledge/CodingGuideline.js'
import type { DocumentBaseContext } from '../DocumentBaseContext.js'

export type LlmContextBuildContext = DocumentBaseContext & {
  knowledge: {
    codingGuideline: CodingGuideline
  }
}
