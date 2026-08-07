import type { CodingGuideline } from '../../schemas/knowledge/CodingGuideline.js'
import type { DocumentBaseContext } from '../DocumentBaseContext.js'

/**
 * Represents the context required for building LLM prompts, extending the base document context with specific coding guidelines.
 */
export type LlmContextBuildContext = DocumentBaseContext & {
  knowledge: {
    codingGuideline: CodingGuideline
  }
}
