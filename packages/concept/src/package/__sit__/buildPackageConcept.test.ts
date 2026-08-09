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
import { createVercelAiLayer } from '@gyomu/ai/provider/vercel'
import { AI_MODELS } from '@gyomu/ai'
import { DocumentSectionRouteId } from '@gyomu/ai-compiler/document'
import { buildPackageConcept } from '../buildPackageConcept.js'
import type { FileChange } from '@gyomu/schema/snapshot'

const layer = Layer.provideMerge(MainLayer, ConfigLayer).pipe(
  Layer.provideMerge(PlatformLayer),
  Layer.provideMerge(FileSearchServiceLayer),
)
const runQAWithEnvOrThrow = makeRunner(
  createVercelAiLayer(
    new Map([[DocumentSectionRouteId, { nodes: [{ retry: 3, registry: AI_MODELS }] }]]),
  ),
)

const describeIfApiKey = process.env.GEMINI_API_KEY ? describe : describe.skip

const createPackageConceptProgram = async (changedFiles?: Array<FileChange> | undefined) => {
  const program = Effect.gen(function* () {
    const project = yield* initializeProjectContext({
      repoRoot: FullPath(destRoot),
      projectRelativePath: WorkspaceRelativePath('.'),
    })
    const option = {
      retryOption: {},
      changedFiles: changedFiles,
      metadataRoot: 'mock-gyomu',
    }
    // yield* buildDirectoryConcept(project, option)
    return yield* buildPackageConcept(project, option)
  })
  return await runQAWithEnvOrThrow(program, layer)
}
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

const destRoot = path.join(tmpdir(), 'concept-project-integration')
beforeAll(async () => {
  await fs.rm(destRoot, { recursive: true, force: true })
  await fs.mkdir(destRoot, { recursive: true })
  await prepare()
})

const prepare = async () => {
  const destCasePath = destRoot
  await copyDir(path.join('test-fixtures', 'package-integration'), destCasePath)
}

describeIfApiKey('buildPackageConcept', () => {
  test('integration test', async () => {
    const result = await createPackageConceptProgram()
    console.dir(result, { depth: null })
  }, 270000)
})
