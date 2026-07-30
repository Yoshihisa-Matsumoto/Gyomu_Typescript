import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect, Layer } from 'effect'

import { writeStringToFile } from '@gyomu/infra/fs'
import { SupportedTranslationLanguages } from '@gyomu/schema/schemas/document'
import { AiModelRoute } from '@gyomu/ai'
import { makeRunner } from '@gyomu/schema/effect'
import { IOError } from '@gyomu/schema'
import { initializeReadmeBuildContext } from '../initializeReadmeBuildContext.js'

import { collectTransationTargets } from '../../document/translation/collectTranslationTargets.js'
import { createTranslationPlan } from '../../document/translation/createTranslationPlan.js'
import { translateReadme } from '../translation/translateReadme.js'
import { applyTranslations } from '../../document/translation/applyTranslations.js'
import { renderReadmeMarkdown } from '../render/renderReadmeMarkdown.js'
import { generateReadmeFiles } from '../generateReadmeFiles.js'
import { DocumentBuilderError } from '../../error/DocumentBuilderError.js'
import { buildSections } from '../../document/builder/buildSections.js'
import { README_SECTION_BUILDERS } from '../builder/builder.js'

vi.mock('../initializeReadmeBuildContext.js')
vi.mock('../../document/builder/buildSections.js')
vi.mock('../../document/translation/collectTranslationTargets.js')
vi.mock('../../document/translation/createTranslationPlan.js')
vi.mock('../translation/translateReadme.js')
vi.mock('../../document/translation/applyTranslations.js')
vi.mock('../render/renderReadmeMarkdown.js')
// vi.mock('../internal/getReadmeFileName.js')

vi.mock('@gyomu/infra/fs', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await importOriginal<typeof import('@gyomu/infra/fs')>()

  return {
    ...actual,
    writeStringToFile: vi.fn(),
  }
})
const DummyReadmeContext = {
  analysis: {
    package: {
      name: 'sample-package',
    },
  },
} as any
const DummyProjectContext = {
  projectRoot: './project',
  packages: [],
} as any
const DummySections = [
  {
    id: 'overview',
    title: 'Overview',
    nodes: [],
  },
] as any
const DummyTranslationTargets = [
  {
    id: '1',
    text: 'Overview',
  },
] as any
const DummyTranslationResult = {} as any

const mockAiModelService = Layer.succeed(AiModelRoute, {
  generateObject: () => Effect.succeed({ object: {} }),
} as any)
const runQAWithEnvOrThrow = makeRunner(mockAiModelService)

describe('generateReadmeFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(initializeReadmeBuildContext).mockReturnValue(Effect.succeed(DummyReadmeContext))

    vi.mocked(buildSections).mockReturnValue(Effect.succeed(DummySections))

    vi.mocked(collectTransationTargets).mockReturnValue(DummyTranslationTargets)

    vi.mocked(createTranslationPlan).mockImplementation((language) => ({
      language,
      targets: [],
      destination: [],
    }))

    vi.mocked(translateReadme).mockReturnValue(Effect.succeed(DummyTranslationResult))

    vi.mocked(applyTranslations).mockReturnValue(Effect.void)

    vi.mocked(renderReadmeMarkdown).mockReturnValue('# README')

    // vi.mocked(getReadmeFileName).mockImplementation((language) => `README.${language}.md`)

    vi.mocked(writeStringToFile).mockReturnValue(Effect.void)
  })

  describe('success', () => {
    it('generate README for every language', async () => {
      vi.mocked(initializeReadmeBuildContext).mockReturnValue(Effect.succeed(DummyReadmeContext))

      vi.mocked(buildSections).mockReturnValue(Effect.succeed(DummySections))

      vi.mocked(collectTransationTargets).mockReturnValue(DummyTranslationTargets)

      vi.mocked(createTranslationPlan).mockImplementation((language) => ({
        language,
        targets: [],
        destination: [],
      }))

      vi.mocked(translateReadme).mockReturnValue(Effect.succeed(DummyTranslationResult))

      vi.mocked(applyTranslations).mockReturnValue(Effect.void)

      vi.mocked(renderReadmeMarkdown).mockReturnValue('# README')

      // vi.mocked(getReadmeFileName).mockImplementation((lang) => `README.${lang}.md`)

      vi.mocked(writeStringToFile).mockReturnValue(Effect.void)

      await runQAWithEnvOrThrow(generateReadmeFiles(DummyProjectContext))

      expect(buildSections).toHaveBeenCalledWith(
        DummyReadmeContext,
        README_SECTION_BUILDERS,
        undefined,
      )

      expect(translateReadme).toHaveBeenCalledTimes(SupportedTranslationLanguages.length)

      expect(writeStringToFile).toHaveBeenCalledTimes(SupportedTranslationLanguages.length)
      expect(writeStringToFile).toHaveBeenNthCalledWith(
        1,
        join('.', 'project', 'README.md'),
        '# README',
      )
      expect(translateReadme).toHaveBeenCalledWith(DummyReadmeContext, expect.any(String), [])
    })
    it('creates translation plans from generated sections', async () => {
      await runQAWithEnvOrThrow(generateReadmeFiles(DummyProjectContext))

      expect(collectTransationTargets).toHaveBeenCalledWith(DummySections)

      expect(createTranslationPlan).toHaveBeenCalledWith(
        expect.any(String),
        DummyTranslationTargets,
        DummySections,
      )
    })
  })

  describe('failure', () => {
    it('fails when translate fails', async () => {
      vi.mocked(translateReadme).mockReturnValue(
        Effect.fail(
          new DocumentBuilderError({
            cause: undefined,
            message: 'Fake',
            filePath: '',
            packageName: 'a',
            phase: 'translate',
          }),
        ),
      )

      await expect(runQAWithEnvOrThrow(generateReadmeFiles(DummyProjectContext))).rejects.toThrow()

      expect(writeStringToFile).not.toHaveBeenCalled()
    })

    it('fails when writing README fails', async () => {
      vi.mocked(writeStringToFile).mockReturnValue(
        Effect.fail(
          new IOError({
            layer: 'filesystem' as const,
            message: 'fake',
            operation: 'write' as const,
            cause: undefined,
          }),
        ),
      )

      await expect(runQAWithEnvOrThrow(generateReadmeFiles(DummyProjectContext))).rejects.toThrow()
    })
  })
})
