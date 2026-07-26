import { fromSync } from '@gyomu/schema/effect'
import { DocumentBuilderError } from '../../error/DocumentBuilderError.js'
import type { Effect } from 'effect'
import type { TranslationPlan } from './TranslationPlan.js'
import type {
  EditableDocumentContent,
  Section,
  TranslationResult,
} from '@gyomu/schema/schemas/document'
import type { ReadmeBuildContext } from '@gyomu/schema/concept'

/**
 * Applies a set of translation items to a documentation structure.
 *
 * @param context The build context containing analysis and package information.
 *
 * @param plan The translation plan defining the destination structure.
 *
 * @param result The list of translation items to apply.
 *
 * @returns An Effect representing the translation application operation, failing with a DocumentBuilderError if the operation cannot be completed.
 */
export const applyTranslations = (
  context: ReadmeBuildContext,
  plan: TranslationPlan,
  result: TranslationResult,
): Effect.Effect<void, DocumentBuilderError> =>
  fromSync(DocumentBuilderError, (e) => ({
    cause: plan,
    sectionId: '',
    filePath: '',
    message: 'fail to apply translations',
    packageName: context.analysis.package.name,
    phase: 'document-build' as const,
  }))(() => {
    for (const item of result) {
      const id = item.id
      const path = id.split('.')
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const sectionId = path[0]!
      let remainingPath = path.slice(1)
      const targetSection = findSectionById(context, sectionId, plan.destination)

      if (remainingPath[0] == 'title') {
        targetSection.title = item.translation
        continue
      }
      if (remainingPath[0] != 'contents') {
        throw new DocumentBuilderError({
          cause: remainingPath[0],
          sectionId,
          filePath: '',
          message: 'invalid path item',
          packageName: context.analysis.package.name,
          phase: 'document-build' as const,
        })
      }
      const contentIndex = Number(remainingPath[1])
      const targetContent = targetSection.contents[contentIndex] as
        EditableDocumentContent | undefined

      if (!targetContent) {
        throw new DocumentBuilderError({
          cause: targetSection.contents,
          sectionId,
          filePath: '',
          message: 'can not find target content',
          packageName: context.analysis.package.name,
          phase: 'document-build' as const,
        })
      }
      remainingPath = remainingPath.slice(2)
      applyTranslationItemIntoContent(context, item, path, remainingPath, targetContent, sectionId)
    }
  })

const applyTranslationItemIntoContent = (
  context: ReadmeBuildContext,
  item: {
    readonly id: string
    readonly translation: string
  },
  path: Array<string>,
  remainingPath: Array<string>,
  targetContent: EditableDocumentContent,
  sectionId: string,
) => {
  const itemName = remainingPath[0]
  if (itemName == 'title') {
    // Code
    if (targetContent.type != 'code') {
      throw new DocumentBuilderError({
        cause: targetContent,
        sectionId,
        filePath: '',
        message: 'should be code block',
        packageName: context.analysis.package.name,
        phase: 'document-build' as const,
        details: path,
      })
    }
    targetContent.title = item.translation
  } else if (itemName == 'text') {
    // Paragraph
    if (targetContent.type != 'paragraph') {
      throw new DocumentBuilderError({
        cause: targetContent,
        sectionId,
        filePath: '',
        message: 'should be paragraph block',
        packageName: context.analysis.package.name,
        phase: 'document-build' as const,
        details: path,
      })
    }
    targetContent.text = item.translation
  } else if (itemName == 'items') {
    // bullet list
    if (targetContent.type != 'bullet-list') {
      throw new DocumentBuilderError({
        cause: targetContent,
        sectionId,
        filePath: '',
        message: 'should be bullet list block',
        packageName: context.analysis.package.name,
        phase: 'document-build' as const,
        details: path,
      })
    }
    const itemIndex = Number(remainingPath[1])
    targetContent.items[itemIndex] = item.translation
  } else {
    throw new DocumentBuilderError({
      cause: targetContent,
      sectionId,
      filePath: '',
      message: 'Invalid ItemName',
      packageName: context.analysis.package.name,
      phase: 'document-build' as const,
      details: path,
    })
  }
}

const findSectionById = (
  context: ReadmeBuildContext,
  sectionId: string,
  sections: ReadonlyArray<Section>,
): Section => {
  const targetSection = sections.find((s) => s.id == sectionId)
  if (!targetSection)
    throw new DocumentBuilderError({
      cause: undefined,
      sectionId,
      filePath: '',
      message: 'can not find target Seciton Id',
      packageName: context.analysis.package.name,
      phase: 'document-build' as const,
    })
  return targetSection
}
