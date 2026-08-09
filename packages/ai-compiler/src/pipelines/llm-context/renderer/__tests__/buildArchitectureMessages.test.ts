import { describe, expect, it, vi } from 'vitest'
import { Effect } from 'effect'
import { MessageRole } from '@gyomu/schema/conversation'
import { ProjectRelativePath } from '@gyomu/schema/typescript'
import { PlatformLayer } from '@gyomu/infra'
import { buildArchitectureMessages } from '../buildArchitectureMessages.js'
import type { PackageConcept } from '@gyomu/schema/schemas/concept'
import type { LlmContextBuildContext, PackageAnalysis } from '@gyomu/schema/concept'

vi.mock('../prompt/index.js', () => ({
  loadPrompt: vi.fn(() => Effect.succeed('architecture prompt')),
}))

const createDirectory = (path: string, score: number): PackageAnalysis['directories'][number] => ({
  path: ProjectRelativePath(path),
  facts: {
    publicApiSymbolCount: score,
    rootApiSymbolCount: 0,
  },
  concept: {
    summary: `Summary of ${path}`,
    responsibilities: [`Responsibility of ${path}`],
    concepts: [`Concept of ${path}`],
    relationships: [`Relationship of ${path}`],
    designDecisions: [`Design decision of ${path}`],
    importance: 'Core',
  },
})

const createContext = (): LlmContextBuildContext =>
  ({
    analysis: {
      package: {} as PackageAnalysis['package'],
      exports: [],
      dependencies: [],
      exportedFiles: [],
      directories: [
        createDirectory('src/a', 100),
        createDirectory('src/b', 80),
        createDirectory('src/c', 60),
        createDirectory('src/d', 40),
        createDirectory('src/e', 20),
        createDirectory('src/f', 10),
      ],
    },
    concept: {
      summary: 'Package summary',
      responsibilities: ['Build concepts', 'Maintain concepts'],
      capabilities: ['Generate documentation'],
    } as unknown as PackageConcept,
  }) as unknown as LlmContextBuildContext

describe('buildArchitectureMessages', () => {
  it('builds system and user messages', async () => {
    const messages = await Effect.runPromise(
      buildArchitectureMessages(createContext()).pipe(Effect.provide(PlatformLayer)),
    )

    expect(messages).toHaveLength(2)

    expect(messages[0]).toMatchObject({
      id: '1',
      role: MessageRole.system,
    })

    expect(messages[1]).toMatchObject({
      id: '2',
      role: MessageRole.user,
    })
  })

  // it('includes package concept information in the user message', async () => {
  //   const messages = await Effect.runPromise(
  //     buildArchitectureMessages(createContext()).pipe(Effect.provide(PlatformLayer)),
  //   )

  //   // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  //   const userData = JSON.parse(messages[1]!.content)

  //   expect(userData).toEqual(
  //     expect.objectContaining({
  //       responsibilities: ['Build concepts', 'Maintain concepts'],
  //     }),
  //   )
  // })

  it('includes the top 5 ranked directories', async () => {
    const messages = await Effect.runPromise(
      buildArchitectureMessages(createContext()).pipe(Effect.provide(PlatformLayer)),
    )

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const userData = JSON.parse(messages[1]!.content)

    expect(userData.directories).toHaveLength(5)

    expect(userData.directories.map((directory: { path: string }) => directory.path)).toEqual([
      'src/a',
      'src/b',
      'src/c',
      'src/d',
      'src/e',
    ])
  })

  it('includes only the required directory concept fields', async () => {
    const messages = await Effect.runPromise(
      buildArchitectureMessages(createContext()).pipe(Effect.provide(PlatformLayer)),
    )

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const userData = JSON.parse(messages[1]!.content)

    expect(userData.directories[0]).toEqual({
      path: 'src/a',
      summary: 'Summary of src/a',
      responsibilities: ['Responsibility of src/a'],
      relationships: ['Relationship of src/a'],
    })

    expect(userData.directories[0]).not.toHaveProperty('concepts')
    expect(userData.directories[0]).not.toHaveProperty('facts')
  })

  it('serializes the user data as formatted JSON', async () => {
    const messages = await Effect.runPromise(
      buildArchitectureMessages(createContext()).pipe(Effect.provide(PlatformLayer)),
    )

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    expect(messages[1]!.content).toContain('\n')
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    expect(messages[1]!.content).toContain('  "directories"')
  })
})
