/**
 * Represents the result of an AI operation returning a structured object along with the original response text.
 */
export interface AiObjectResult<T> {
  /**
   * The parsed structured object extracted from the AI response.
   */
  readonly object: T

  /**
   * The raw text response from the AI.
   */
  readonly text: string
}
