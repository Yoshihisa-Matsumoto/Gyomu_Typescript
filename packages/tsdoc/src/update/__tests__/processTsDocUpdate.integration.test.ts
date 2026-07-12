import path from 'node:path'
import fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { Effect, Layer } from 'effect'
import { ConfigLayer, MainLayer, PlatformLayer } from '@gyomu/infra'

import { makeRunner } from '@gyomu/schema/effect'
import 'dotenv/config'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { AiModelRoute } from '@gyomu/ai'
import { analyzeFile } from '@gyomu/ts-analysis'
import { ProjectRelativePath } from '@gyomu/schema/typescript'
import { buildJsDocUpdatePlanWithRetry } from '../internal/buildJsDocUpdatePlanWithRetry.js'
import { processTsDocUpdate } from '../processTsDocUpdate.js'
import { createFixtureProject } from './createFixtureProject.js'
import { compareFilesEffect } from './baseClass.js'
import type { JsDocUpdatePlan } from '@gyomu/ai-compiler/jsdoc-update'

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

const destRoot = path.join(tmpdir(), 'tsdoc-e2e')

let updateFixture: ReturnType<typeof createFixtureProject>
beforeAll(async () => {
  await copyDir(path.join('./test-fixtures', 'update-e2e'), path.join(destRoot, 'update-e2e'))
  updateFixture = createFixtureProject(path.join('update-e2e'), destRoot)
  console.log(updateFixture)
})

const layer = Layer.provideMerge(MainLayer, ConfigLayer).pipe(Layer.provideMerge(PlatformLayer))
const mockAiModelService = Layer.succeed(AiModelRoute, {
  generateObject: () =>
    Effect.succeed({
      object: {},
    }),
} as any)
const runQAWithEnvOrThrow = makeRunner(mockAiModelService)

vi.mock('../internal/buildJsDocUpdatePlanWithRetry.js', () => ({
  buildJsDocUpdatePlanWithRetry: vi.fn(),
}))

const processTsDocUpdateProgram = async (sourceFile: string, expectedPlans: JsDocUpdatePlan) => {
  // for (const expectedPlan of expectedPlans)
  vi.mocked(buildJsDocUpdatePlanWithRetry).mockReturnValueOnce(Effect.succeed(expectedPlans))
  const program = Effect.gen(function* () {
    const sourceRelativePath = ProjectRelativePath(path.join('src', sourceFile))
    const fileResult = yield* analyzeFile(updateFixture, sourceRelativePath)
    yield* processTsDocUpdate(updateFixture, fileResult)
    const sourceAbsolute = path.join(updateFixture.projectRoot, sourceRelativePath)
    const expectedAbsolute = path.join(updateFixture.projectRoot, 'expected', sourceFile)
    const isEqual = yield* compareFilesEffect(sourceAbsolute, expectedAbsolute)
    expect(isEqual).toBeTruthy()
  })
  await runQAWithEnvOrThrow(program, layer)
}

describe('processTsDocUpdate integration', () => {
  it.each([
    // 'generated-simple',
    // 'existing-jsdoc',
    // 'overload-function',
    // 'mixed-exports',
    // 'returns-needed',
    // // 'advanced-nested',
    // 'nested-object-properties',
    'array',
    'optional',
  ])('compare exactly same as expected', async (...args: Array<string>) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const target_file = args[0]!

    const expectedPlan = (
      await fs.readFile(path.join(updateFixture.projectRoot, 'expectedPlan', target_file + '.json'))
    ).toString()
    const planObject = JSON.parse(expectedPlan) as JsDocUpdatePlan

    await processTsDocUpdateProgram(target_file + '.ts', planObject)
  })
})
