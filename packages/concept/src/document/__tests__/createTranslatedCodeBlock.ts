import type { CodeBlock } from '@gyomu/schema/schemas/document'

export const createTranslatedCodeBlock = (code = 'const value = true;'): CodeBlock => ({
  type: 'code',
  language: 'typescript',
  code,
})
