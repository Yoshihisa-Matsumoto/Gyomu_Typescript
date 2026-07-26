import { createPromptLoader } from '../../../createPromptLoader.js'

/**
 * Initializes and exports a prompt loader instance derived from the current module's file location.
 */
export const loadPrompt = createPromptLoader(import.meta.url)
