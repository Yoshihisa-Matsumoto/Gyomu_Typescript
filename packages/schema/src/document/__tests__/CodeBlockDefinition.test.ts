import { describe, expect, it } from 'vitest'

import { validateCodeBlock } from '../CodeBlockDefinition.js'
import type { CodeBlock } from '../../schemas/document/index.js'

describe('validateCodeBlock', () => {
  it('returns valid when code block is preserved except title translation', () => {
    const source: CodeBlock = {
      type: 'code',
      code: 'const value = 1',
      language: 'typescript',
      title: 'Example',
    }

    const destination: CodeBlock = {
      type: 'code',
      code: 'const value = 1',
      language: 'typescript',
      title: '例',
    }

    expect(validateCodeBlock(source, destination)).toEqual({
      issues: [],
      isValid: true,
    })
  })

  it('returns issue when source has title but destination does not', () => {
    const source: CodeBlock = {
      type: 'code',
      code: 'const value = 1',
      language: 'typescript',
      title: 'Example',
    }

    const destination: CodeBlock = {
      type: 'code',
      code: 'const value = 1',
      language: 'typescript',
    }

    const result = validateCodeBlock(source, destination)

    expect(result.isValid).toBe(false)
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: 'CODE_BLOCK_TITLE_MISMATCH',
        message: 'Title is not translated',
      }),
    )
  })

  it('returns issue when destination creates title without source title', () => {
    const source: CodeBlock = {
      type: 'code',
      code: 'const value = 1',
      language: 'typescript',
    }

    const destination: CodeBlock = {
      type: 'code',
      code: 'const value = 1',
      language: 'typescript',
      title: 'Created title',
    }

    const result = validateCodeBlock(source, destination)

    expect(result.isValid).toBe(false)
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: 'CODE_BLOCK_TITLE_MISMATCH',
        message: 'Title is created from nothing',
      }),
    )
  })

  it('returns issue when code is changed', () => {
    const source: CodeBlock = {
      type: 'code',
      code: 'const value = 1',
      language: 'typescript',
    }

    const destination: CodeBlock = {
      type: 'code',
      code: 'const value = 2',
      language: 'typescript',
    }

    const result = validateCodeBlock(source, destination)

    expect(result.isValid).toBe(false)
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: 'CODE_BLOCK_CODE_MISMATCH',
      }),
    )
  })

  it('returns issue when language is changed', () => {
    const source: CodeBlock = {
      type: 'code',
      code: 'const value = 1',
      language: 'typescript',
    }

    const destination: CodeBlock = {
      type: 'code',
      code: 'const value = 1',
      language: 'javascript',
    }

    const result = validateCodeBlock(source, destination)

    expect(result.isValid).toBe(false)
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: 'CODE_BLOCK_LANGUAGE_MISMATCH',
      }),
    )
  })

  it('returns multiple issues when multiple fields are changed', () => {
    const source: CodeBlock = {
      type: 'code',
      code: 'const value = 1',
      language: 'typescript',
      title: 'Example',
    }

    const destination: CodeBlock = {
      type: 'code',
      code: 'const value = 2',
      language: 'javascript',
    }

    const result = validateCodeBlock(source, destination)

    expect(result.isValid).toBe(false)
    expect(result.issues).toHaveLength(3)

    expect(result.issues.map((issue) => issue.code)).toEqual([
      'CODE_BLOCK_TITLE_MISMATCH',
      'CODE_BLOCK_CODE_MISMATCH',
      'CODE_BLOCK_LANGUAGE_MISMATCH',
    ])
  })
})
