import path from 'node:path'
import fs from 'node:fs/promises'
import fsSync from 'node:fs'
import { tmpdir } from 'node:os'
import { Effect, Layer } from 'effect'
import { ConfigLayer, MainLayer, PlatformLayer } from '@gyomu/infra'
import { FileSearchServiceLayer } from '@gyomu/infra/fs'
import { beforeAll, describe, expect, test, vi } from 'vitest'
import { initializeProjectContext } from '@gyomu/ts-analysis'
import { FullPath } from '@gyomu/schema'
import { WorkspaceRelativePath } from '@gyomu/schema/typescript'
import { makeRunner } from '@gyomu/schema/effect'
import { createMockAiLayer } from '@gyomu/ai'
import {
  DocumentSectionRouteId,
  buildSectionItem,
  buildSectionObject,
} from '@gyomu/ai-compiler/document'
import { executeDocumentContentTranslation } from '@gyomu/ai-compiler/translation'
import { generateLlmContextFile } from '../generateLlmContextFile.js'
import { createTranslatedParagraph } from '../../document/__tests__/createTranslatedParagraph.js'
import { createTranslatedBulletList } from '../../document/__tests__/createTranslatedBulletList.js'
import type { BulletList, DocumentContent } from '@gyomu/schema/schemas/document'

vi.mock('@gyomu/ai-compiler/document', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await importOriginal<typeof import('@gyomu/ai-compiler/document')>()
  return {
    ...actual,
    buildSectionItem: vi.fn(),
    buildSectionObject: vi.fn(),
  }
})

const mockedBuildSectionItem = vi.mocked(buildSectionItem)
const mockedBuildSectionObject = vi.mocked(buildSectionObject)

vi.mock('@gyomu/ai-compiler/translation', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await importOriginal<typeof import('@gyomu/ai-compiler/translation')>()
  return {
    ...actual,
    executeDocumentContentTranslation: vi.fn(),
  }
})

const mockedExecuteDocumentContentTranslation = vi.mocked(executeDocumentContentTranslation)

const prepareMockTranslation = (translations: Array<DocumentContent>) => {
  for (const content of translations) {
    mockedExecuteDocumentContentTranslation.mockReturnValueOnce(Effect.succeed(content))
  }
  for (const content of translations) {
    mockedExecuteDocumentContentTranslation.mockReturnValueOnce(Effect.succeed(content))
  }
  mockedBuildSectionItem.mockReturnValue(Effect.succeed('test'))

  mockedBuildSectionObject.mockReturnValue(
    Effect.succeed({
      type: 'bullet-list',
      items: [{ text: 'ab', translationId: 1 }],
    } satisfies BulletList),
  )
}

const layer = Layer.provideMerge(MainLayer, ConfigLayer).pipe(
  Layer.provideMerge(PlatformLayer),
  Layer.provideMerge(FileSearchServiceLayer),
)
const runQAWithEnvOrThrow = makeRunner(createMockAiLayer(DocumentSectionRouteId))

async function copyDir(src: string, dest: string) {
  await fs.rm(dest, { recursive: true, force: true })
  await fs.mkdir(dest, { recursive: true })

  const entries = await fs.readdir(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath)
    } else {
      await fs.copyFile(srcPath, destPath)
    }
  }
}

const destRoot = path.join(tmpdir(), 'llmcontext-generation')
beforeAll(async () => {
  await fs.rm(destRoot, { recursive: true, force: true })
  await fs.mkdir(destRoot, { recursive: true })
})

const prepare = async (testCase: string) => {
  const destCasePath = path.join(destRoot, testCase)
  await copyDir(path.join('test-fixtures', 'llm-context', 'project'), destCasePath)

  await copyDir(path.join(destCasePath, 'mock-gyomu'), path.join(destCasePath, '.gyomu'))
  return destCasePath
}

const generateLlmContextProgram = (testCase: string) =>
  Effect.gen(function* () {
    const repoRoot = FullPath(path.join(destRoot, testCase))

    const context = yield* initializeProjectContext({
      repoRoot: repoRoot,
      projectRelativePath: WorkspaceRelativePath('.'),
    })
    return yield* generateLlmContextFile(context, {})
  })

const runProgram = async (testCase: string) => {
  return await runQAWithEnvOrThrow(generateLlmContextProgram(testCase), layer)
}

describe('generateLlmContext integration', () => {
  test('Generate Check', async () => {
    const targetDir = await prepare('generateCheck')

    prepareMockTranslation([
      createTranslatedParagraph(),
      createTranslatedBulletList(),
      createTranslatedParagraph(),
      createTranslatedBulletList(),
      createTranslatedParagraph(),
      createTranslatedBulletList(),
      createTranslatedParagraph(),
    ])

    await runProgram('generateCheck')

    const readmePath = path.join(targetDir, 'Context.md')
    expect(fsSync.existsSync(readmePath)).toBe(true)
    const content = await fs.readFile(readmePath, 'utf8')
    expect(content).toContain('#')
  }, 60_000)
})
