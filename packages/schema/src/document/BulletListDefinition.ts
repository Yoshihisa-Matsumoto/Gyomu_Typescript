import { BulletList } from '../schemas/document/index.js'
import type { BulletListItem } from '../schemas/document/index.js'
import type {
  DocumentContentDefinitionBase,
  ValidationIssue,
} from './DocumentContentDefinitionBase.js'

export const validateBulletList = (source: BulletList, destination: BulletList) => {
  const issues: Array<ValidationIssue> = []
  if (source.items.length != destination.items.length) {
    issues.push({
      code: 'BULLET_LIST_ITEM_COUNT_CHANGED',
      message: 'The translated bullet list contains a different number of items.',
      translationId: undefined,
      details: {
        sourceCount: source.items.length.toString(),
        translatedCount: destination.items.length.toString(),
      },
      repairInstruction: 'Translate again while preserving every bullet item from the source.',
    })
  } else {
    let isValid = true
    source.items.forEach((sourceItem, index) => {
      if (isValid) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const destinationItem = destination.items[index]!
        if (sourceItem.translationId != destinationItem.translationId) {
          isValid = false
          issues.push({
            code: 'BULLET_LIST_ITEM_TRANSLATIONID_MISMATCH',
            message: 'The translated bullet list has mismatched TranslationId',
            translationId: undefined,
            repairInstruction: `BulletListItem's TranslationId must be same`,
          })
        }
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (isValid) {
      source.items.forEach((sourceItem, index) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const destinationItem = destination.items[index]!

        const result = validateBulletListItem(sourceItem, destinationItem, sourceItem.translationId)
        issues.push(...result)
      })
    }
  }
  return { issues: issues, isValid: issues.length == 0 }
}

export const BulletListDefinition: DocumentContentDefinitionBase<typeof BulletList> = {
  type: 'bullet-list',
  schema: BulletList,
  translationInstruction:
    'you need to translate only `title` field if exist. If not exist, do not create sentense',
  reconciliation: {
    validate: validateBulletList,
  },
}

const validateBulletListItem = (
  sourceItem: BulletListItem,
  destinationItem: BulletListItem,
  translationId: number,
): Array<ValidationIssue> => {
  const issues: Array<ValidationIssue> = []

  if ((sourceItem.children?.length ?? 0) != (destinationItem.children?.length ?? 0)) {
    issues.push({
      code: 'BULLET_LIST_ITEM_COUNT_CHANGED',
      message: 'The translated bullet list contains a different number of items.',
      translationId,
      details: {
        sourceCount: (sourceItem.children?.length ?? 0).toString(),
        translatedCount: (destinationItem.children?.length ?? 0).toString(),
      },
      repairInstruction: `Translate again while preserving every bullet item from the source for transactionId=${sourceItem.translationId}.`,
    })
  } else {
    let isValid = true
    sourceItem.children?.forEach((sourceChild, index) => {
      if (isValid) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        const destinationChild = destinationItem.children?.[index]!
        if (sourceChild.translationId != destinationChild.translationId) {
          isValid = false
          issues.push({
            code: 'BULLET_LIST_ITEM_TRANSLATIONID_MISMATCH',
            message: 'The translated bullet list has mismatched TranslationId',
            translationId,
            repairInstruction: `BulletListItem's TranslationId must be same`,
          })
        }
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (isValid) {
      sourceItem.children?.forEach((sourceChild, index) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        const destinationChild = destinationItem.children?.[index]!

        const result = validateBulletListItem(
          sourceChild,
          destinationChild,
          sourceChild.translationId,
        )
        issues.push(...result)
      })
    }
  }

  return issues
}
