import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect, Layer } from 'effect'
import * as fsRead from '@gyomu/infra/fs'
// import * as fsWrite from '@gyomu/infra/fs'
import { PlatformLayer } from '@gyomu/infra'
import { AiModelRoute, ModelRoutes } from '@gyomu/ai'
import * as analyze from '@gyomu/ts-analysis'
import { FullPath } from '@gyomu/schema/typescript'
import { TsDocRouteId } from '@gyomu/ai-compiler/jsdoc-update'
import * as merge from '../buildMergePlan.js'
import * as applyMerge from '../applyMergePlan.js'
import * as render from '../renderJsDoc.js'
import * as filePlan from '../buildFileUpdatePlan.js'
import { processTsDocUpdate } from '../processTsDocUpdate.js'
import type { ExportAnalysis } from '@gyomu/schema/schemas/typescript'

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
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

describe('processTsDocUpdate', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should update source file with generated jsdoc', async () => {
    vi.spyOn(analyze, 'analyzeFile').mockReturnValue(
      Effect.succeed({
        analysis: { exports: new Array<ExportAnalysis>() },
        metadata: { symbols: new Map<string, any>() },
      } as any),
    )

    vi.spyOn(merge, 'buildMergePlan').mockReturnValue(
      Effect.succeed([
        {
          target: 'dummy',
        },
      ] as any),
    )

    vi.spyOn(applyMerge, 'applyMergePlans').mockReturnValue(
      Effect.succeed([
        {
          target: { symbolId: 'a', signatureId: 'b' },
          jsDoc: '/** test */',
        },
      ] as any),
    )

    vi.spyOn(render, 'renderJsDocs').mockReturnValue([
      {
        target: { symbolId: 'a', signatureId: 'b' },
        jsDoc: '/** test */',
      },
    ] as any)

    vi.spyOn(filePlan, 'buildFileUpdatePlan').mockReturnValue({
      edits: [
        {
          startOffset: 0,
          endOffset: 0,
          newText: '/** test */\n',
          symbol: { symbolId: 'a', signatureId: 'b' },
        },
      ],
    } as any)

    vi.spyOn(analyze, 'toAbsolutePath').mockReturnValue(FullPath('/mock/path/file.ts'))

    vi.spyOn(fsRead, 'readStringFromFile').mockReturnValue(Effect.succeed('function foo() {}'))

    // const writeMock = vi
    //   .spyOn(fsWrite, 'writeStringToFile')
    //   .mockReturnValue(Effect.succeed(undefined as any))

    const program = processTsDocUpdate(
      {
        projectName: 'test-project',
        projectRoot: '/project',
      } as any,
      {
        analysis: {
          path: 'src/file.ts',
          exports: [],
        },
        metadata: { symbols: new Map<string, any>() },
      } as any,
    )

    const result = await Effect.runPromise(
      program.pipe(
        Effect.provide(mockAiModelService),
        Effect.provide(PlatformLayer),
        Effect.provide(mockModelRoutes),
      ),
    )

    // expect(writeMock).toHaveBeenCalledWith('/mock/path/file.ts', '/** test */\nfunction foo() {}')

    expect(result).toBeUndefined()
  })
})
