import type { Section, SectionLocation, TranslationTarget } from '@gyomu/schema/schemas/document'

/**
 * Collects translatable text segments from a set of documentation sections.
 *
 * @param sections The list of sections to scan for translatable content.
 *
 * @returns An array of translation target objects containing the source text and its location.
 */
export const collectTransationTargets = (
  sections: ReadonlyArray<Section>,
): Array<TranslationTarget> => {
  const result: Array<TranslationTarget> = []
  sections.forEach((section) => {
    if (section.title) {
      const location: SectionLocation = { sectionId: section.id, path: ['title'] }
      result.push({ source: section.title, location, id: computeId(location) })
    }

    section.contents.forEach((content, index) => {
      switch (content.type) {
        case 'bullet-list':
          content.items.forEach((item, index2) => {
            const path: Array<string | number> = ['contents', index]
            path.push('items', index2)
            const location: SectionLocation = { sectionId: section.id, path }
            result.push({ source: item, location, id: computeId(location) })
          })
          break
        case 'code':
          if (content.title) {
            const path: Array<string | number> = ['contents', index]
            path.push('title')
            const location: SectionLocation = { sectionId: section.id, path }
            result.push({ source: content.title, location, id: computeId(location) })
          }
          break
        case 'paragraph': {
          const path: Array<string | number> = ['contents', index]
          path.push('text')
          const location: SectionLocation = { sectionId: section.id, path }
          result.push({ source: content.text, location, id: computeId(location) })
          break
        }
      }
    })
  })

  return result
}

const computeId = (location: SectionLocation): string => {
  return [location.sectionId, ...location.path].join('.')
}
