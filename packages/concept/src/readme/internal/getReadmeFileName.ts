import type { LanguageCodes } from '@gyomu/schema/schemas/document'

export const getReadmeFileName = (language: LanguageCodes): string => {
  if (language == 'en') return 'README.md'
  return `README.${language}.md`
}
