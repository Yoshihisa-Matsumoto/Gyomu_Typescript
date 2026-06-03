import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect, Layer } from 'effect'
// eslint-disable-next-line import/no-duplicates
import * as fsRead from '@gyomu/infra/fs'
// eslint-disable-next-line import/no-duplicates
import * as fsWrite from '@gyomu/infra/fs'
import { PlatformLayer } from '@gyomu/infra'
import { AiModelService } from '@gyomu/ai'
import * as analyze from '../../analysis/analyzeFile.js'
import * as merge from '../buildMergePlan.js'
import * as applyMerge from '../applyMergePlan.js'
import * as render from '../renderJsDoc.js'
import * as filePlan from '../buildFileUpdatePlan.js'
import * as pathUtil from '../../shared/index.js'
import { processTsDocUpdate } from '../processTsDocUpdate.js'

const mockAiModelService = Layer.succeed(AiModelService, {
  generateObject: () =>
    Effect.succeed({
      object: {},
    }),
} as any)
describe('processTsDocUpdate', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should update source file with generated jsdoc', async () => {
    vi.spyOn(analyze, 'analyzeFile').mockReturnValue(
      Effect.succeed({
        symbols: {},
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

    vi.spyOn(pathUtil, 'toProjectAbsolutePath').mockReturnValue('/mock/path/file.ts')

    vi.spyOn(fsRead, 'readStringFromFile').mockReturnValue(Effect.succeed('function foo() {}'))

    const writeMock = vi
      .spyOn(fsWrite, 'writeStringToFile')
      .mockReturnValue(Effect.succeed(undefined as any))

    const program = processTsDocUpdate(
      {
        projectName: 'test-project',
        projectRoot: '/project',
      } as any,
      'src/file.ts',
    )

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(mockAiModelService), Effect.provide(PlatformLayer)),
    )

    expect(writeMock).toHaveBeenCalledWith('/mock/path/file.ts', '/** test */\nfunction foo() {}')

    expect(result).toBeUndefined()
  })
})
