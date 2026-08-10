import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect } from 'effect'
import { executeDocumentContentTranslation } from '@gyomu/ai-compiler/translation'
import { createMockAiLayer } from '@gyomu/ai'
import { DocumentSectionRouteId } from '@gyomu/ai-compiler/document'
import { PlatformLayer } from '@gyomu/infra'
import { TranslationError } from '@gyomu/schema'
import { translateSection } from '../translateSection.js'
import type { BuiltSection } from '@gyomu/schema/document'

const mockAiLayer = createMockAiLayer(DocumentSectionRouteId)

vi.mock('@gyomu/ai-compiler/translation', () => ({
  executeDocumentContentTranslation: vi.fn(),
}))

const mockedExecuteDocumentContentTranslation = vi.mocked(executeDocumentContentTranslation)

describe('translateSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const section = {
    section: {
      id: 'overview',
      title: 'Overview',
      contents: [
        {
          type: 'paragraph',
          text: 'Hello',
        },
        {
          type: 'paragraph',
          text: 'World',
        },
      ],
    },
    translation: {
      strategy: 'translate' as const,
      translations: [
        {
          type: 'translate',
        },
        {
          type: 'translate',
        },
      ],
    },
  } as unknown as BuiltSection

  it('translates all contents and returns section', async () => {
    mockedExecuteDocumentContentTranslation
      .mockReturnValueOnce(
        Effect.succeed({
          type: 'paragraph',
          text: 'こんにちは',
        }),
      )
      .mockReturnValueOnce(
        Effect.succeed({
          type: 'paragraph',
          text: '世界',
        }),
      )

    const result = await Effect.runPromise(
      translateSection(section, 'ja').pipe(
        Effect.provide(PlatformLayer),
        Effect.provide(mockAiLayer),
      ),
    )

    expect(result).toEqual({
      ...section.section,
      contents: [
        {
          type: 'paragraph',
          text: 'こんにちは',
        },
        {
          type: 'paragraph',
          text: '世界',
        },
      ],
    })

    expect(mockedExecuteDocumentContentTranslation).toHaveBeenCalledTimes(2)

    expect(mockedExecuteDocumentContentTranslation).toHaveBeenNthCalledWith(1, {
      language: 'ja',
      sectionId: 'overview',
      context: section.section.contents[0],
      sectionDefinition: section.translation,
      contentStrategy: (section.translation as any).translations[0],
      retryOption: undefined,
    })

    expect(mockedExecuteDocumentContentTranslation).toHaveBeenNthCalledWith(2, {
      language: 'ja',
      sectionId: 'overview',
      context: section.section.contents[1],
      sectionDefinition: section.translation,
      contentStrategy: (section.translation as any).translations[1],
      retryOption: undefined,
    })
  })

  it('passes retry option', async () => {
    mockedExecuteDocumentContentTranslation.mockReturnValue(
      Effect.succeed({
        type: 'paragraph',
        text: 'translated',
      }),
    )

    const retryOption = {
      maxAttempts: 3,
    }

    await Effect.runPromise(
      translateSection(section, 'ja', {
        retryOption,
      }).pipe(Effect.provide(PlatformLayer), Effect.provide(mockAiLayer)),
    )

    expect(mockedExecuteDocumentContentTranslation).toHaveBeenCalledWith(
      expect.objectContaining({
        retryOption,
      }),
    )
  })

  it('returns original contents without translation when strategy is none', async () => {
    const nonTranslatedSection = {
      section: {
        id: 'editing-rules',
        title: undefined,
        contents: [
          {
            type: 'bullet-list',
            items: ['Do not modify generated files.'],
          },
        ],
      },
      translation: {
        strategy: 'none' as const,
      },
    } as unknown as BuiltSection

    const result = await Effect.runPromise(
      translateSection(nonTranslatedSection, 'ja').pipe(
        Effect.provide(PlatformLayer),
        Effect.provide(mockAiLayer),
      ),
    )

    expect(result).toEqual(nonTranslatedSection.section)

    expect(mockedExecuteDocumentContentTranslation).not.toHaveBeenCalled()
  })

  it('fails when translation fails', async () => {
    const error = new TranslationError({
      cause: undefined,
      message: 'translation failed',
      phase: 'translate',
      sectionId: 'overview',
      contentType: 'paragraph',
    })

    mockedExecuteDocumentContentTranslation.mockReturnValue(Effect.fail(error))

    const result = Effect.runPromise(
      translateSection(section, 'ja').pipe(
        Effect.provide(PlatformLayer),
        Effect.provide(mockAiLayer),
      ),
    )

    await expect(result).rejects.toThrow('translation failed')
  })
})
