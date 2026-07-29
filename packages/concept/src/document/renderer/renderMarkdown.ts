import { SupportedTranslationLanguages } from '@gyomu/schema/schemas/document'
import type { DocumentBaseContext } from '@gyomu/schema/concept'
import type { DocumentContent, LanguageCodes, Section } from '@gyomu/schema/schemas/document'

import type { TranslationPlan } from '../translation/TranslationPlan.js'

/**
 * Renders a translation plan into a Markdown-formatted document string using the provided context and callback functions for titles and language links.
 *
 * @param args Configuration object containing the document context, translation plan, and functions for generating section titles and navigation links.
 *
 * @returns A Markdown string representing the rendered document.
 */
export const renderMarkdown = <TContext extends DocumentBaseContext>(args: {
  context: TContext
  plan: TranslationPlan
  getTitle: (context: TContext) => string
  getSectionTitle: (language: LanguageCodes, section: Section) => string
  getLanguageLink?: ((language: LanguageCodes, plan: TranslationPlan) => string) | undefined
}) => {
  const { context, plan, getTitle, getSectionTitle, getLanguageLink } = args
  const title = `# ` + getTitle(context)
  const link = getLanguageLink ? renderLink(plan, getLanguageLink) + '\n\n' : ''
  return (
    title +
    '\n\n' +
    link +
    plan.destination
      .map((section) => renderSection(plan.language, section, getSectionTitle))
      .join('\n\n')
  )
}

const renderLink = (
  plan: TranslationPlan,
  getLanguageLink: (language: LanguageCodes, plan: TranslationPlan) => string,
): string => {
  return SupportedTranslationLanguages.map((language) => getLanguageLink(language, plan)).join(
    ' | ',
  )
}

const renderSection = (
  language: LanguageCodes,
  section: Section,
  getSectionTitle: (language: LanguageCodes, section: Section) => string,
): string => {
  const title = `## ` + getSectionTitle(language, section)

  const body = section.contents.map((content) => renderContent(content)).join('\n\n')

  return title + '\n\n' + body
}

const renderContent = (content: DocumentContent): string => {
  switch (content.type) {
    case 'paragraph':
      return content.text
    case 'code': {
      const CODE = '```'
      const prefix = content.title ? `### ${content.title}\n\n` : ''
      return `${prefix}${CODE}${content.language}
${content.code}
${CODE}`
    }
    case 'bullet-list':
      return content.items.map((item) => `- ${item}`).join('\n')
  }
}
