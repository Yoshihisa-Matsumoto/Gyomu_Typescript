import { TranslationError } from '@gyomu/schema'
import { BulletListDefinition } from '@gyomu/schema/document'
import { fromSync } from '@gyomu/schema/effect'
import { findBulleListItem } from '@gyomu/schema/schemas/document'
import type { BulletList, BulletListItem } from '@gyomu/schema/schemas/document'
import type {
  DocumentContentTranslationStrategy,
  SectionTranslationDefinition,
  ValidationResult,
} from '@gyomu/schema/document'

/**
 * Updates the bullet list translation context by merging validation results and updating valid items.
 *
 * @param args The arguments containing section ID, definitions, validation results, and contexts.
 *
 * @returns Returns an Effect containing the updated bullet list context and validation result.
 */
export const updateBulletListContext = (args: {
  sectionId: string
  sectionDefinition: SectionTranslationDefinition
  currentValidation: ValidationResult
  previousValidation: ValidationResult | undefined
  originalContext: BulletList
  translatedContext: BulletList
}) => {
  const {
    sectionDefinition,
    currentValidation,
    previousValidation,
    originalContext,
    translatedContext,
  } = args
  return fromSync(TranslationError, () => ({
    contentType: 'bullet-list' as const,
    message: 'fail on building update context',
    phase: 'retry-context' as const,
    sectionId: args.sectionId,
  }))(() => {
    const activeValidationList = mergeValidationResultForBulletList(
      currentValidation,
      previousValidation,
      originalContext,
    )

    // Base は context ( 前回)
    // ここにresult(今回)のうち、成功したものを更新していく
    const validIdList = retrieveValidIdListFromBulletList(activeValidationList, originalContext)
    const previousValidIdList = previousValidation
      ? retrieveValidIdListFromBulletList(previousValidation, originalContext)
      : []
    for (const translationId of validIdList) {
      if (previousValidIdList.includes(translationId)) continue
      const validItem = findBulleListItem(originalContext, translationId)
      const validItemFromResult = findBulleListItem(translatedContext, translationId)
      if (!validItem || !validItemFromResult) {
        throw new TranslationError({
          cause: undefined,
          contentType: 'bullet-list',
          message: 'TranslationId Not Found on BulletList',
          phase: 'retry-context',
          sectionId: args.sectionId,
          translationId,
        })
      }
      validItem.text = validItemFromResult.text
    }
    return { context: originalContext, validation: activeValidationList }
  })
}

const mergeValidationResultForBulletList = (
  currentValidation: ValidationResult,
  previousValidation: ValidationResult | undefined,
  context: BulletList,
): ValidationResult => {
  if (!previousValidation) return currentValidation

  if (previousValidation.issues.find((issue) => !issue.translationId)) {
    // All Invalid
    return currentValidation
  } else {
    const validIdList = retrieveValidIdListFromBulletList(previousValidation, context)

    const filteredIssues = currentValidation.issues.filter(
      (issue) => issue.translationId && !validIdList.includes(issue.translationId),
    )
    return {
      issues: filteredIssues,
      isValid: filteredIssues.length == 0,
    }
  }
}

const retrieveValidIdListFromBulletList = (validation: ValidationResult, context: BulletList) => {
  const invalidIdList = validation.issues.map((issue) => issue.translationId!)
  const validIdList: Array<number> = []
  context.items.forEach((item) => {
    const result = retrieveValidIdFromBulletListItem(invalidIdList, item)
    validIdList.push(...result)
  })
  return validIdList
}

const retrieveValidIdFromBulletListItem = (invalidIdList: Array<number>, item: BulletListItem) => {
  const validIdList: Array<number> = []

  if (!invalidIdList.includes(item.translationId)) validIdList.push(item.translationId)

  item.children?.forEach((child) => {
    const result = retrieveValidIdFromBulletListItem(invalidIdList, child)
    validIdList.push(...result)
  })

  return validIdList
}

/**
 * Translation strategy implementation for bullet list documents.
 */
export const BulletListTranslationStrategy: DocumentContentTranslationStrategy<typeof BulletList> =
  {
    definition: BulletListDefinition,
    retryContextUpdater: updateBulletListContext,
  }
