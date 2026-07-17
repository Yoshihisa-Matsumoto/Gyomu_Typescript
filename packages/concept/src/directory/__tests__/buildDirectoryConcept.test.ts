import path from 'node:path'
import { readdir, rm } from 'node:fs/promises'
import { ConfigLayer, MainLayer, PlatformLayer } from '@gyomu/infra'
import { Effect, Layer } from 'effect'
import { makeRunner } from '@gyomu/schema/effect'
import { AiModelRoute } from '@gyomu/ai'
import { beforeAll, describe, expect, test, vi } from 'vitest'
import { ProjectRelativePath } from '@gyomu/schema/typescript'
import { buildDirectoryConcept } from '../buildDirectoryConcept.js'
import { generateDirectoryConcept } from '../internal/generateDirectoryConcept.js'
import { saveDirectoryConcept } from '../internal/saveDirectoryConcept.js'
import { createFixtureProject } from './createFixtureProject.js'
import type { DirectoryConcept } from '@gyomu/schema/schemas/concept'
import type { FileChange } from '@gyomu/schema/snapshot'

const dummyConcept = {
  summary: 'dummy',
  concepts: [],
  designDecisions: [],
  relationships: [],
  responsibilities: [],
} satisfies DirectoryConcept

vi.mock('../internal/generateDirectoryConcept.js', async () => {
  const actual = await vi.importActual<
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    typeof import('../internal/generateDirectoryConcept.js')
  >('../internal/generateDirectoryConcept.js')

  return {
    ...actual,
    generateDirectoryConcept: vi.fn(() => Effect.succeed(dummyConcept)),
  }
})

const layer = Layer.provideMerge(MainLayer, ConfigLayer).pipe(Layer.provideMerge(PlatformLayer))
const mockAiModelService = Layer.succeed(AiModelRoute, {
  generateObject: () => Effect.succeed({ object: dummyConcept }),
} as any)
const runQAWithEnvOrThrow = makeRunner(mockAiModelService)

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

const mockedGenerate = vi.mocked(generateDirectoryConcept)

beforeAll(async () => {
  await removeGyomuDirectories(path.join('./test-fixtures', 'directory'))
})

describe('buildDirectoryConcept', () => {
  test('simple', async () => {
    const result = await createDirectoryConceptProgram('simple')
    console.log(result)
    expect(result.changed).toBeFalsy()
    expect(mockedGenerate).toHaveBeenCalledTimes(1)

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
    const input = mockedGenerate.mock.calls[0]?.[1]!

    expect(input.files).toHaveLength(2)
    expect(input.subDirectories).toEqual([])
  })

  test('nested', async () => {
    const result = await createDirectoryConceptProgram('nested')
    console.log(result)
    expect(result.changed).toBeFalsy()
    expect(mockedGenerate).toHaveBeenCalledTimes(2)

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
    const input1 = mockedGenerate.mock.calls[0]?.[1]!

    expect(input1.files.map((f) => f.path)).toEqual(
      expect.arrayContaining(['src/service/service.ts', 'src/service/helper.ts']),
    )
    expect(input1.subDirectories).toEqual([])

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
    const input2 = mockedGenerate.mock.calls[1]?.[1]!

    expect(input2.files.map((f) => f.path)).toEqual(expect.arrayContaining(['src/index.ts']))
    expect(input2.files[0]?.dependencies).toEqual(
      expect.arrayContaining([{ target: 'createGreeting', external: false }]),
    )
    expect(input2.subDirectories.map((p) => p.path)).toEqual(['service'])
  })

  test('empty', async () => {
    const result = await createDirectoryConceptProgram('empty')
    console.log(result)
    expect(result.changed).toBeFalsy()
    expect(mockedGenerate).toHaveBeenCalledTimes(1)

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
    const input = mockedGenerate.mock.calls[0]?.[1]!

    expect(input.files).toHaveLength(0)
    expect(input.subDirectories).toEqual([])
  })

  test('changedFiles', async () => {
    const result = await createDirectoryConceptProgram('changedFiles', [
      { projectRelativePath: ProjectRelativePath('src/index.ts'), type: 'updated' },
    ])
    console.log(result)
    expect(result.changed).toBeTruthy()
    expect(mockedGenerate).toHaveBeenCalledTimes(1)

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
    const input = mockedGenerate.mock.calls[0]?.[1]!

    expect(input.files).toHaveLength(2)
    expect(input.subDirectories).toEqual([])
  })

  test('cache', async () => {
    const cacheConcept = {
      summary: 'cache',
      concepts: [],
      designDecisions: [],
      relationships: [],
      responsibilities: [],
    } satisfies DirectoryConcept
    await Effect.runPromise(
      saveDirectoryConcept(
        createFixtureProject(path.join('directory', 'cache')),
        ProjectRelativePath('./src'),
        cacheConcept,
      ).pipe(Effect.provide(PlatformLayer)),
    )

    const result = await createDirectoryConceptProgram('cache')

    expect(result.changed).toBeFalsy()
    expect(result.concept.summary).toBe('cache')
    expect(mockedGenerate).toHaveBeenCalledTimes(0)
  })

  test('targetFolder', async () => {
    const result = await createDirectoryConceptProgram(
      'targetFolder',
      undefined,
      ProjectRelativePath('src/service'),
    )
    console.log(result)
    expect(result.changed).toBeFalsy()
    expect(mockedGenerate).toHaveBeenCalledTimes(1)

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
    const input = mockedGenerate.mock.calls[0]?.[1]!

    expect(input.files).toHaveLength(2)
    expect(input.subDirectories).toEqual([])
  })
  test('export', async () => {
    const result = await createDirectoryConceptProgram('export', undefined)
    console.log(result)
    expect(result.changed).toBeFalsy()
    expect(mockedGenerate).toHaveBeenCalledTimes(2)

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
    const input = mockedGenerate.mock.calls[1]?.[1]!
    console.dir(input, { depth: null })
    expect(input.files).toHaveLength(1)
    expect(input.subDirectories).toHaveLength(1)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    expect(input.subDirectories[0]!.path).toBe('service')
  })
})
