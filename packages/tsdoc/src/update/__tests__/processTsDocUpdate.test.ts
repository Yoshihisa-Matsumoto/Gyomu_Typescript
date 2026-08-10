import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect, Layer } from 'effect'
import * as fs from '@gyomu/infra/fs'
import { PlatformLayer } from '@gyomu/infra'
import { AiModelRoute, ModelRoutes } from '@gyomu/ai'
import * as analyze from '@gyomu/ts-analysis'
import { FullPath, IOError } from '@gyomu/schema'
import { TsDocRouteId } from '@gyomu/ai-compiler/jsdoc-update'
import * as merge from '../buildMergePlan.js'
import * as applyMerge from '../applyMergePlan.js'
import * as render from '../renderJsDoc.js'
import * as filePlan from '../buildFileUpdatePlan.js'
import { processTsDocUpdate } from '../processTsDocUpdate.js'

const mockAiModelService = Layer.succeed(AiModelRoute, {
  generateObject: () =>
    Effect.succeed({
      object: {},
    }),
} as any)

const modelRoute = {
  nodes: [{ retry: 1, registry: { fast: {} } } as any],
} as any

const mockModelRoutes = Layer.succeed(ModelRoutes, new Map([[TsDocRouteId, modelRoute]]))

const createFileResult = (overrides: Record<string, unknown> = {}) =>
  ({
    analysis: {
      path: 'src/file.ts',
      exports: [
        {
          kind: 'local',
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      ...((overrides.analysis ?? {}) as object),
    },
    metadata: {
      symbols: new Map(),
    },
    ...overrides,
  }) as any

const createContext = () =>
  ({
    projectName: 'test-project',
    projectRoot: '/project',
  }) as any

const createMergePlans = () =>
  [
    {
      target: 'dummy',
    },
  ] as any

const createUpdatedJsDocs = () =>
  [
    {
      target: {
        symbolId: 'a',
        signatureId: 'b',
      },
      jsDoc: '/** test */',
    },
  ] as any

const createRenderedJsDocs = () =>
  [
    {
      target: {
        symbolId: 'a',
        signatureId: 'b',
      },
      jsDoc: '/** test */',
    },
  ] as any

const createFileUpdatePlan = () =>
  ({
    edits: [
      {
        startOffset: 0,
        endOffset: 0,
        newText: '/** test */\n',
        symbol: {
          symbolId: 'a',
          signatureId: 'b',
        },
      },
    ],
  }) as any

const run = async (fileResult = createFileResult(), option?: any) =>
  Effect.runPromise(
    processTsDocUpdate(createContext(), fileResult, option).pipe(
      Effect.provide(mockAiModelService),
      Effect.provide(PlatformLayer),
      Effect.provide(mockModelRoutes),
    ),
  )

describe('processTsDocUpdate', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    vi.spyOn(analyze, 'toAbsolutePath').mockReturnValue(FullPath('/mock/path/file.ts'))

    vi.spyOn(analyze, 'findWorkspaceRoot').mockReturnValue(Effect.succeed(FullPath('/repository')))

    vi.spyOn(merge, 'buildMergePlan').mockReturnValue(Effect.succeed(createMergePlans()))

    vi.spyOn(applyMerge, 'applyMergePlans').mockReturnValue(Effect.succeed(createUpdatedJsDocs()))

    vi.spyOn(render, 'renderJsDocs').mockReturnValue(createRenderedJsDocs())

    vi.spyOn(filePlan, 'buildFileUpdatePlan').mockReturnValue(createFileUpdatePlan())

    vi.spyOn(fs, 'readStringFromFile').mockReturnValue(Effect.succeed('function foo() {}'))

    vi.spyOn(fs, 'writeStringToFile').mockReturnValue(Effect.succeed(undefined as any))

    vi.spyOn(fs, 'makeDirectory').mockReturnValue(Effect.succeed(undefined as any))

    vi.spyOn(fs, 'makeDirectory').mockReturnValue(Effect.succeed(undefined as any))
  })

  it('returns immediately when the file has no exports', async () => {
    await expect(
      run(
        createFileResult({
          analysis: {
            exports: [],
          },
        }),
      ),
    ).resolves.toBeUndefined()

    expect(merge.buildMergePlan).not.toHaveBeenCalled()
    expect(applyMerge.applyMergePlans).not.toHaveBeenCalled()
    expect(fs.readStringFromFile).not.toHaveBeenCalled()
    expect(fs.writeStringToFile).not.toHaveBeenCalled()
  })

  it('returns without updating when noLLMRequest is enabled', async () => {
    await expect(
      run(createFileResult(), {
        action: {
          noLLMRequest: true,
        },
      }),
    ).resolves.toBeUndefined()

    expect(merge.buildMergePlan).toHaveBeenCalledTimes(1)
    expect(applyMerge.applyMergePlans).not.toHaveBeenCalled()
    expect(fs.readStringFromFile).not.toHaveBeenCalled()
    expect(fs.writeStringToFile).not.toHaveBeenCalled()
  })

  it('updates the source file with generated JSDoc', async () => {
    await expect(run()).resolves.toBeUndefined()

    expect(merge.buildMergePlan).toHaveBeenCalledWith('test-project', expect.anything(), undefined)

    expect(applyMerge.applyMergePlans).toHaveBeenCalledWith(expect.anything(), createMergePlans())

    expect(render.renderJsDocs).toHaveBeenCalledWith(createUpdatedJsDocs())

    expect(filePlan.buildFileUpdatePlan).toHaveBeenCalledWith(
      expect.anything(),
      createRenderedJsDocs(),
    )

    expect(fs.readStringFromFile).toHaveBeenCalledWith('/mock/path/file.ts')

    expect(fs.writeStringToFile).toHaveBeenCalledWith('/mock/path/file.ts', expect.any(String))
  })

  it('does not write the file when NoUpdateTSDoc is enabled', async () => {
    await expect(
      run(createFileResult(), {
        action: {
          NoUpdateTSDoc: true,
        },
      }),
    ).resolves.toBeUndefined()

    expect(fs.readStringFromFile).toHaveBeenCalledWith('/mock/path/file.ts')

    expect(fs.writeStringToFile).not.toHaveBeenCalled()
  })

  it('writes debug information for updated JSDoc to console', async () => {
    const consoleSpy = vi.spyOn(console, 'dir').mockImplementation(() => undefined)

    await run(createFileResult(), {
      debugInfo: {
        UpdatedSymbolJsDoc: true,
        DumpToFile: false,
      },
    })

    expect(consoleSpy).toHaveBeenCalledWith(createUpdatedJsDocs(), { depth: null })

    consoleSpy.mockRestore()
  })

  it('writes updated JSDoc debug information to a file', async () => {
    await run(createFileResult(), {
      debugInfo: {
        UpdatedSymbolJsDoc: true,
        DumpToFile: true,
      },
    })

    expect(fs.writeStringToFile).toHaveBeenCalledWith(
      './log/UpdatedSymbolJsDoc.txt',
      JSON.stringify(createUpdatedJsDocs(), null, 2),
    )
  })

  it('writes rendered JSDoc debug information to console', async () => {
    const consoleSpy = vi.spyOn(console, 'dir').mockImplementation(() => undefined)

    await run(createFileResult(), {
      debugInfo: {
        RenderedSymbolJsDoc: true,
        DumpToFile: false,
      },
    })

    expect(consoleSpy).toHaveBeenCalledWith(createRenderedJsDocs(), { depth: null })

    consoleSpy.mockRestore()
  })

  it('writes rendered JSDoc debug information to a file', async () => {
    await run(createFileResult(), {
      debugInfo: {
        RenderedSymbolJsDoc: true,
        DumpToFile: true,
      },
    })

    expect(fs.writeStringToFile).toHaveBeenCalledWith(
      './log/RenderedJsDoc.txt',
      JSON.stringify(createRenderedJsDocs(), null, 2),
    )
  })

  it('writes file update plan debug information to console', async () => {
    const consoleSpy = vi.spyOn(console, 'dir').mockImplementation(() => undefined)

    await run(createFileResult(), {
      debugInfo: {
        FileUpdatePlan: true,
        DumpToFile: false,
      },
    })

    expect(consoleSpy).toHaveBeenCalledWith(createFileUpdatePlan(), { depth: null })

    consoleSpy.mockRestore()
  })

  it('writes file update plan debug information to a file', async () => {
    await run(createFileResult(), {
      debugInfo: {
        FileUpdatePlan: true,
        DumpToFile: true,
      },
    })

    expect(fs.writeStringToFile).toHaveBeenCalledWith(
      './log/FileUpdatePlan.txt',
      JSON.stringify(createFileUpdatePlan(), null, 2),
    )
  })

  it('writes the updated content to a temporary folder', async () => {
    vi.mocked(analyze.toAbsolutePath)
      .mockReturnValueOnce(FullPath('/mock/path/file.ts'))
      .mockReturnValueOnce(FullPath('/tmp/tsdoc-temp/test-project/src/file.ts'))

    await run(createFileResult(), {
      action: {
        WriteToTempFolder: true,
      },
    })

    expect(analyze.findWorkspaceRoot).toHaveBeenCalledWith('/project')

    expect(fs.makeDirectory).toHaveBeenCalledWith('/tmp/tsdoc-temp/test-project/src/file.ts', true)

    expect(fs.writeStringToFile).toHaveBeenCalledWith(
      '/tmp/tsdoc-temp/test-project/src/file.ts',
      expect.any(String),
    )
  })

  it('fails with UpdateError when reading the source file fails', async () => {
    const cause = new IOError({
      message: 'read failed',
      cause: undefined,
      layer: 'filesystem',
      operation: 'read',
    })

    vi.mocked(fs.readStringFromFile).mockReturnValue(Effect.fail(cause))

    const result = await Effect.runPromiseExit(
      processTsDocUpdate(createContext(), createFileResult()).pipe(
        Effect.provide(mockAiModelService),
        Effect.provide(PlatformLayer),
        Effect.provide(mockModelRoutes),
      ),
    )

    expect(result._tag).toBe('Failure')

    if (result._tag === 'Failure') {
      expect(result.cause).toBeDefined()
    }
  })

  it('fails with UpdateError when writing the source file fails', async () => {
    const cause = new IOError({
      message: 'write failed',
      cause: undefined,
      layer: 'filesystem',
      operation: 'write',
    })

    vi.mocked(fs.writeStringToFile).mockReturnValue(Effect.fail(cause))

    const result = await Effect.runPromiseExit(
      processTsDocUpdate(createContext(), createFileResult()).pipe(
        Effect.provide(mockAiModelService),
        Effect.provide(PlatformLayer),
        Effect.provide(mockModelRoutes),
      ),
    )

    expect(result._tag).toBe('Failure')

    if (result._tag === 'Failure') {
      expect(result.cause).toBeDefined()
    }
  })
})
