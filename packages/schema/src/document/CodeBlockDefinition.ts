import { CodeBlock } from '../schemas/document/index.js'
import type {
  DocumentContentDefinitionBase,
  ValidationIssue,
} from './DocumentContentDefinitionBase.js'

export const validateCodeBlock = (source: CodeBlock, destination: CodeBlock) => {
  const issues: Array<ValidationIssue> = []
  if (source.title && !destination.title) {
    issues.push({
      code: 'CODE_BLOCK_TITLE_MISMATCH',
      message: 'Title is not translated',
      repairInstruction: 'Translate code block title properly',
    })
  } else if (!source.title && destination.title) {
    issues.push({
      code: 'CODE_BLOCK_TITLE_MISMATCH',
      message: 'Title is created from nothing',
      repairInstruction: 'Must not create sentense from non-existence title',
    })
  }
  if (source.code != destination.code) {
    issues.push({
      code: 'CODE_BLOCK_CODE_MISMATCH',
      message: 'code is translated',
      repairInstruction: 'code MUST not be translated or transformed',
    })
  }
  if (source.language != destination.language) {
    issues.push({
      code: 'CODE_BLOCK_LANGUAGE_MISMATCH',
      message: 'language is translated',
      repairInstruction: 'language MUST not be translated or transformed',
    })
  }
  return { issues: issues, isValid: issues.length == 0 }
}

export const CodeBlockDefinition: DocumentContentDefinitionBase<typeof CodeBlock> = {
  type: 'code',
  schema: CodeBlock,
  translationInstruction:
    'you need to translate only `title` field if exist. If not exist, do not create sentense',
  reconciliation: {
    validate: validateCodeBlock,
  },
}
