import type { LanguageCodes } from '@gyomu/schema/schemas/document'

/**
 * Returns the localized README filename based on the provided language code.
 *
 * @param language The ISO language code for the requested README.
 *
 * @returns The localized filename, such as 'README.md' for English or 'README.xx.md' for other languages.
 */
export const getReadmeFileName = (language: LanguageCodes): string => {
  if (language == 'en') return 'README.md'
  return `README.${language}.md`
}
