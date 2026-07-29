import { README_LINK, README_SECTION_TITLES } from '@gyomu/schema/concept'
import { SupportedTranslationLanguages } from '@gyomu/schema/schemas/document'
import { getReadmeFileName } from '../internal/getReadmeFileName.js'
import type { DocumentContent, LanguageCodes, Section } from '@gyomu/schema/schemas/document'
import type { TranslationPlan } from '../translation/TranslationPlan.js'
import type { ReadmeBuildContext, ReadmeSectionId } from '@gyomu/schema/concept'

/**
 * Renders a README file content from the given build context and translation plan.
 *
 * @param context The build context containing metadata about the package.
 *
 * @param plan The translation plan defining the structure and language of the documentation.
 *
 * @param needLink Whether to include a link in the generated markdown. Defaults to false.
 *
 * @returns The rendered markdown content as a string.
 */
export const renderMarkdown = (
  context: ReadmeBuildContext,
  plan: TranslationPlan,
  needLink: boolean = false,
) => {
  const title = `# ${context.knowledge.package.displayName}`
  const link = needLink ? renderLink(plan) + '\n\n' : ''
  return (
    title +
    '\n\n' +
    link +
    plan.destination.map((section) => renderSection(plan.language, section)).join('\n\n')
  )
}

const renderLink = (plan: TranslationPlan): string => {
  return SupportedTranslationLanguages.map((language) => getLanguageLink(language, plan)).join(
    ' | ',
  )
}

const getLanguageLink = (language: LanguageCodes, plan: TranslationPlan): string => {
  if (language == plan.language) {
    return README_LINK[language]
  }
  return `[${README_LINK[language]}](${getReadmeFileName(language)})`
}

const renderSection = (language: LanguageCodes, section: Section): string => {
  const title = `## ${section.title ?? README_SECTION_TITLES[language][section.id as ReadmeSectionId]}`

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
