import { describe, expect, it } from 'vitest'
import { README_DOCUMENT_DEFINITION, ReadmeMarkdownRenderer } from '../definition.js'
import type { ProjectContext } from '@gyomu/ts-analysis'

describe('README_DOCUMENT_DEFINITION', () => {
  it('supports english and japanese', () => {
    expect(README_DOCUMENT_DEFINITION.supportedLanguages).toEqual(['en', 'ja'])
  })

  it('uses markdown renderer', () => {
    expect(README_DOCUMENT_DEFINITION.output.renderer).toBe(ReadmeMarkdownRenderer)
  })

  it('resolves README filename', () => {
    const path = README_DOCUMENT_DEFINITION.output.filepathResolver.resolve(
      {
        projectRoot: '/tmp/project',
      } as ProjectContext,
      'ja',
    )

    expect(path).toContain('README.ja.md')
  })
})
