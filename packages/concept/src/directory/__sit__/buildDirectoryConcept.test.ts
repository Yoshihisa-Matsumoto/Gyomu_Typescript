import path from 'node:path'
import { readdir, rm } from 'node:fs/promises'
import { ConfigLayer, MainLayer, PlatformLayer } from '@gyomu/infra'
import { Effect, Layer } from 'effect'
import { makeRunner } from '@gyomu/schema/effect'
import { AI_MODELS } from '@gyomu/ai'
import { beforeAll, describe, expect, test } from 'vitest'
import { DirectoryConceptRouteId } from '@gyomu/ai-compiler/directory-concept'
import { createVercelAiLayer } from '@gyomu/ai/provider/vercel'
import { buildDirectoryConcept } from '../buildDirectoryConcept.js'
import { createFixtureProject } from '../__tests__/createFixtureProject.js'
import type { ProjectRelativePath } from '@gyomu/schema/typescript'
import type { FileChange } from '@gyomu/schema/snapshot'

const layer = Layer.provideMerge(MainLayer, ConfigLayer).pipe(Layer.provideMerge(PlatformLayer))
const runQAWithEnvOrThrow = makeRunner(
  createVercelAiLayer(
    new Map([[DirectoryConceptRouteId, { nodes: [{ retry: 3, registry: AI_MODELS }] }]]),
  ),
)

const describeIfApiKey = process.env.GEMINI_API_KEY ? describe : describe.skip

const createDirectoryConceptProgram = async (
  subPath: string,
  changedFiles?: Array<FileChange> | undefined,
  targetFolder?: ProjectRelativePath | undefined,
) => {
  const project = createFixtureProject(path.join('directory', subPath))
  const program = Effect.gen(function* () {
    return yield* buildDirectoryConcept(project, {
      retryOption: {},
      changedFiles: changedFiles,
      targetFolder,
      action: { WriteToTempFolder: true },
    })
  })
  return await runQAWithEnvOrThrow(program, layer)
}

const removeGyomuDirectories = async (rootDir: string): Promise<void> => {
  const entries = await readdir(rootDir, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue
    }

    const fullPath = path.join(rootDir, entry.name)

    if (entry.name === '.gyomu') {
      await rm(fullPath, {
        recursive: true,
        force: true,
      })
      continue
    }

    await removeGyomuDirectories(fullPath)
  }
}

beforeAll(async () => {
  await removeGyomuDirectories(path.join('./test-fixtures', 'directory'))
})

describeIfApiKey('buildDirectoryConcept', () => {
  test('nested', async () => {
    const result = await createDirectoryConceptProgram('nested')
    console.log(result)
    expect(result.changed).toBeFalsy()
    expect(result.concept.summary.length).toBeGreaterThan(20)
  })
})
