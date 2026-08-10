import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect, Layer } from 'effect'
import { FileSearchServiceLayer, writeStringToFile } from '@gyomu/infra/fs'
import { AiModelRoute, ModelRoutes } from '@gyomu/ai'
import { DocumentSectionRouteId } from '@gyomu/ai-compiler/document'
import { PlatformLayer } from '@gyomu/infra'
import { IOError, TranslationError } from '@gyomu/schema'
import { translateSection } from '../translation/translateSection.js'
import { buildSections } from '../builder/buildSections.js'
import { generateDocument } from '../generateDocument.js'
import { DocumentBuilderError } from '../../error/DocumentBuilderError.js'
import type { ModelRoute, ModelRouteId, RouteNode } from '@gyomu/ai'

const mockAiModelService = Layer.succeed(AiModelRoute, {
  generateObject: () => Effect.succeed({ object: {} }),
} as any)

const modelRoute = {
  nodes: [{ retry: 1, registry: { fast: {} } } as any as RouteNode],
} as ModelRoute
const mockModelRoutes = Layer.succeed(
  ModelRoutes,
  new Map<ModelRouteId, ModelRoute>([[DocumentSectionRouteId, modelRoute]]),
)

vi.mock('../builder/buildSections.js', () => ({
  buildSections: vi.fn(),
}))

vi.mock('../translation/translateSection.js', () => ({
  translateSection: vi.fn(),
}))

vi.mock('@gyomu/infra/fs', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await importOriginal<typeof import('@gyomu/infra/fs')>()

  return {
    ...actual,
    writeStringToFile: vi.fn(),
  }
})

const mockedBuildSections = vi.mocked(buildSections)
const mockedTranslateSection = vi.mocked(translateSection)
const mockedWriteStringToFile = vi.mocked(writeStringToFile)

describe('generateDocument', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const context = {
    analysis: {
      package: {
        name: '@test/package',
      },
    },
  }

  const sections = [
    {
      section: {
        id: 'overview',
      },
      translation: {},
    },
  ] as any

  const translatedSections = [
    {
      id: 'overview',
      contents: [],
    },
  ] as any

  const definition = {
    supportedLanguages: ['en', 'ja'],

    createContext: vi.fn<() => Effect.Effect<typeof context, DocumentBuilderError>>(() =>
      Effect.succeed(context),
    ),

    sectionBuilders: [],

    output: {
      renderer: {
        render: vi.fn(() =>
          Effect.succeed({
            type: 'text',
            content: '# README',
          }),
        ),
      },

      filepathResolver: {
        resolve: vi.fn((_, language) => `README.${language}.md`),
      },
    },

    rendererOptions: {},
  }

  it('generates document for all supported languages', async () => {
    mockedBuildSections.mockReturnValue(Effect.succeed(sections))

    mockedTranslateSection.mockReturnValue(Effect.succeed(translatedSections[0]))

    mockedWriteStringToFile.mockReturnValue(Effect.succeed(undefined))

    await Effect.runPromise(
      generateDocument(definition as never, {} as never).pipe(
        Effect.provide(PlatformLayer),
        Effect.provide(mockAiModelService),
        Effect.provide(mockModelRoutes),
        Effect.provide(FileSearchServiceLayer),
      ),
    )

    expect(definition.createContext).toHaveBeenCalledTimes(1)

    expect(mockedBuildSections).toHaveBeenCalledWith(context, definition.sectionBuilders, undefined)

    expect(mockedTranslateSection).toHaveBeenCalledTimes(2)

    expect(definition.output.renderer.render).toHaveBeenCalledTimes(2)

    expect(mockedWriteStringToFile).toHaveBeenCalledTimes(2)

    expect(mockedWriteStringToFile).toHaveBeenNthCalledWith(1, 'README.en.md', '# README')
  })

  it('does not write when renderer output is not text', async () => {
    mockedBuildSections.mockReturnValue(Effect.succeed(sections))

    mockedTranslateSection.mockReturnValue(Effect.succeed(translatedSections[0]))

    definition.output.renderer.render.mockReturnValue(
      Effect.succeed({
        type: 'binary',
        content: new Uint8Array(),
      } as any),
    )

    await Effect.runPromise(
      generateDocument(definition as never, {} as never).pipe(
        Effect.provide(PlatformLayer),
        Effect.provide(mockAiModelService),
        Effect.provide(mockModelRoutes),
        Effect.provide(FileSearchServiceLayer),
      ),
    )

    expect(mockedWriteStringToFile).not.toHaveBeenCalled()
  })

  it('fails when context creation fails', async () => {
    const error = new DocumentBuilderError({
      message: 'context failed',
      phase: 'context-build',
      cause: undefined,
      filePath: '',
      packageName: '@test/package',
    })

    definition.createContext.mockReturnValue(Effect.fail(error))

    await expect(
      Effect.runPromise(
        generateDocument(definition as never, {} as never).pipe(
          Effect.provide(PlatformLayer),
          Effect.provide(mockAiModelService),
          Effect.provide(mockModelRoutes),
          Effect.provide(FileSearchServiceLayer),
        ),
      ),
    ).rejects.toThrow('context failed')
  })

  it('wraps translation error', async () => {
    mockedBuildSections.mockReturnValue(Effect.succeed(sections))

    mockedTranslateSection.mockReturnValue(
      Effect.fail(
        new TranslationError({
          message: 'translate failed',
          cause: undefined,
          phase: 'translate',
          sectionId: 'overview',
          contentType: 'paragraph',
        }),
      ),
    )

    await expect(
      Effect.runPromise(
        generateDocument(definition as never, {} as never).pipe(
          Effect.provide(PlatformLayer),
          Effect.provide(mockAiModelService),
          Effect.provide(mockModelRoutes),
          Effect.provide(FileSearchServiceLayer),
        ),
      ),
    ).rejects.toThrow()
  })

  it('wraps write error as DocumentBuilderError', async () => {
    mockedBuildSections.mockReturnValue(Effect.succeed(sections))

    mockedTranslateSection.mockReturnValue(Effect.succeed(translatedSections[0]))

    mockedWriteStringToFile.mockReturnValue(
      Effect.fail(
        new IOError({
          cause: undefined,
          message: 'write failed',
          layer: 'filesystem',
          operation: 'write',
        }),
      ),
    )

    await expect(
      Effect.runPromise(
        generateDocument(definition as never, {} as never).pipe(
          Effect.provide(PlatformLayer),
          Effect.provide(mockAiModelService),
          Effect.provide(mockModelRoutes),
          Effect.provide(FileSearchServiceLayer),
        ),
      ),
    ).rejects.toThrow()
  })
})
