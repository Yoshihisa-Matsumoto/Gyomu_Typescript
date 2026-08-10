import { describe, expect, it } from 'vitest'
import {
  LLMCONTEXT_DOCUMENT_DEFINITION,
  LlmContextMarkdownRenderer,
} from '../LLMContextDefinition.js'
import type { ProjectContext } from '@gyomu/ts-analysis'

describe('LLMCONTEXT_DOCUMENT_DEFINITION', () => {
  it('supports english and japanese', () => {
    expect(LLMCONTEXT_DOCUMENT_DEFINITION.supportedLanguages).toEqual(['en'])
  })

  it('uses markdown renderer', () => {
    expect(LLMCONTEXT_DOCUMENT_DEFINITION.output.renderer).toBe(LlmContextMarkdownRenderer)
  })

  it('resolves README filename', () => {
    const path = LLMCONTEXT_DOCUMENT_DEFINITION.output.filepathResolver.resolve(
      {
        projectRoot: '/tmp/project',
      } as ProjectContext,
      'ja',
    )

    expect(path).toContain('Context.md')
  })
})
