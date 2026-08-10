import path from 'node:path'
import fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { Effect, Layer } from 'effect'
import { ConfigLayer, MainLayer, PlatformLayer } from '@gyomu/infra'
import { FileSearchServiceLayer } from '@gyomu/infra/fs'
import { beforeAll, describe, test } from 'vitest'
import { initializeProjectContext } from '@gyomu/ts-analysis'
import { FullPath } from '@gyomu/schema'
import { WorkspaceRelativePath } from '@gyomu/schema/typescript'
import { makeRunner } from '@gyomu/schema/effect'
import { AI_MODELS } from '@gyomu/ai'
import { TranslationRouteId } from '@gyomu/ai-compiler/translation'
import { createVercelAiLayer } from '@gyomu/ai/provider/vercel'
import { DocumentSectionRouteId } from '@gyomu/ai-compiler/document'
import { generateReadmeFiles } from '../generateReadmeFiles.js'

const layer = Layer.provideMerge(MainLayer, ConfigLayer).pipe(
  Layer.provideMerge(PlatformLayer),
  Layer.provideMerge(FileSearchServiceLayer),
)
const runQAWithEnvOrThrow = makeRunner(
  createVercelAiLayer(
    new Map([
      [DocumentSectionRouteId, { nodes: [{ retry: 3, registry: AI_MODELS }] }],
      [TranslationRouteId, { nodes: [{ retry: 3, registry: AI_MODELS }] }],
    ]),
  ),
)

const describeIfApiKey = process.env.GEMINI_API_KEY ? describe : describe.skip

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

const destRoot = path.join(tmpdir(), 'readme-generation')
beforeAll(async () => {
  await fs.rm(destRoot, { recursive: true, force: true })
  await fs.mkdir(destRoot, { recursive: true })
})

const prepare = async (testCase: string) => {
  const destCasePath = path.join(destRoot, testCase)
  await copyDir(path.join('test-fixtures', 'readme', 'project'), destCasePath)

  await copyDir(path.join(destCasePath, 'mock-gyomu'), path.join(destCasePath, '.gyomu'))
  return destCasePath
}

const generateReadmeFilesProgram = (testCase: string) =>
  Effect.gen(function* () {
    const repoRoot = FullPath(path.join(destRoot, testCase))

    const context = yield* initializeProjectContext({
      repoRoot: repoRoot,
      projectRelativePath: WorkspaceRelativePath('.'),
    })
    return yield* generateReadmeFiles(context, {})
  })

const runProgram = async (testCase: string) => {
  return await runQAWithEnvOrThrow(generateReadmeFilesProgram(testCase), layer)
}

describeIfApiKey('generateReadmeFiles integration', () => {
  test('Generate Check', async () => {
    const targetDir = await prepare('generateCheck')

    await runProgram('generateCheck')
  }, 60_000)
})
