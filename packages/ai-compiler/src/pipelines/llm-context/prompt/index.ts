import { createPromptLoader } from '../../../createPromptLoader.js'

/**
 * Creates a prompt loader for the current module path.
 */
export const loadPrompt = createPromptLoader(import.meta.url)
