/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Effect } from 'effect'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SignatureId, SymbolId } from '@gyomu/schema/typescript'
import { createMockAiLayer } from '@gyomu/ai'
import { TsDocRouteId, executeJsDocUpdatePlan } from '@gyomu/ai-compiler/jsdoc-update'
import { writeStringToFile } from '@gyomu/infra/fs'
import { makeRunner, makeRunnerAsReturn } from '@gyomu/schema/effect'
import { toIdentityKey } from '@gyomu/schema/schemas/typescript'
import {
  getTsDocSignatureFromContext,
  validateJsDocUpdatePlan,
} from '../validateJsDocUpdatePlan.js'
import { buildJsDocUpdatePlanWithRetry } from '../buildJsDocUpdatePlanWithRetry.js'
import type { FileAnalysisContext } from '@gyomu/schema/typescript'
import type { JsDocUpdatePlan, TsDocFileContext } from '@gyomu/ai-compiler/jsdoc-update'
import type { UpdateOptions } from '../../UpdateOptions.js'

const runQAWithEnvOrThrow = makeRunner(createMockAiLayer(TsDocRouteId))
const runQAWithResult = makeRunnerAsReturn(createMockAiLayer(TsDocRouteId))

vi.mock('@gyomu/ai-compiler/jsdoc-update', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@gyomu/ai-compiler/jsdoc-update')>()

  return {
    ...actual,
    executeJsDocUpdatePlan: vi.fn(),
  }
})

vi.mock('@gyomu/infra/fs', () => ({
  writeStringToFile: vi.fn(),
}))

vi.mock('../validateJsDocUpdatePlan.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../validateJsDocUpdatePlan.js')>()

  return {
    ...actual,
    getTsDocSignatureFromContext: vi.fn(),
    validateJsDocUpdatePlan: vi.fn(),
  }
})

const mockedExecuteJsDocUpdatePlan = vi.mocked(executeJsDocUpdatePlan)
const mockedWriteStringToFile = vi.mocked(writeStringToFile)
const mockedGetTsDocSignatureFromContext = vi.mocked(getTsDocSignatureFromContext)
const mockedValidateJsDocUpdatePlan = vi.mocked(validateJsDocUpdatePlan)

const createIdentity = (name: string) => ({
  signatureId: SignatureId(`signature:${name}`),
  symbolId: SymbolId(name),
})

const createPlanItem = (name: string) => ({
  identity: createIdentity(name),
})

const createPlan = (...names: Array<string>): JsDocUpdatePlan =>
  names.map((name) => createPlanItem(name)) as unknown as JsDocUpdatePlan

const context = {
  file: {
    path: '/src/User.ts',
  },
} as any as TsDocFileContext

const fileResult = {
  analysis: {
    path: '/src/User.ts',
  },
} as any as FileAnalysisContext

const run = (currentContext: TsDocFileContext = context, option?: UpdateOptions) =>
  runQAWithEnvOrThrow(buildJsDocUpdatePlanWithRetry(currentContext, fileResult, option))

describe('buildJsDocUpdatePlanWithRetry', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    mockedExecuteJsDocUpdatePlan.mockImplementation(() => Effect.succeed(createPlan('User')))

    mockedValidateJsDocUpdatePlan.mockReturnValue({
      isValid: true,
    })

    mockedGetTsDocSignatureFromContext.mockReturnValue(new Set([SymbolId('signature:User/User')]))

    mockedWriteStringToFile.mockReturnValue(Effect.succeed(undefined))
  })

  it('returns the plan immediately when validation succeeds', async () => {
    const plan = createPlan('User')
    mockedGetTsDocSignatureFromContext.mockReturnValue(
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      new Set([toIdentityKey(plan[0]!.identity)]),
    )
    mockedExecuteJsDocUpdatePlan.mockReturnValue(Effect.succeed(plan))

    const result = await run()

    expect(result).toEqual(plan)
    expect(mockedExecuteJsDocUpdatePlan).toHaveBeenCalledTimes(1)
    expect(mockedValidateJsDocUpdatePlan).toHaveBeenCalledTimes(1)
    expect(mockedGetTsDocSignatureFromContext).toHaveBeenCalledTimes(1)
  })

  it('filters plans using signatures from the context', async () => {
    const userPlan = createPlanItem('User')
    const otherPlan = createPlanItem('Other')

    mockedExecuteJsDocUpdatePlan.mockReturnValue(
      Effect.succeed([userPlan, otherPlan] as unknown as JsDocUpdatePlan),
    )

    mockedGetTsDocSignatureFromContext.mockReturnValue(new Set([toIdentityKey(userPlan.identity)]))

    const result = await run()

    expect(result).toEqual([userPlan])
  })

  it('retries when validation fails and succeeds on a later attempt', async () => {
    const firstPlan = createPlan('User')
    const retryPlan = createPlan('Missing')
    mockedGetTsDocSignatureFromContext.mockReturnValueOnce(
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      new Set([toIdentityKey(firstPlan[0]!.identity)]),
    )
    mockedExecuteJsDocUpdatePlan
      .mockReturnValueOnce(Effect.succeed(firstPlan))
      .mockReturnValueOnce(Effect.succeed(retryPlan))

    mockedValidateJsDocUpdatePlan
      .mockReturnValueOnce({
        isValid: false,
        diff: [createIdentity('Missing')],
      })
      .mockReturnValueOnce({
        isValid: true,
      })

    const result = await run()

    expect(result).toEqual([...firstPlan, ...retryPlan])

    expect(mockedExecuteJsDocUpdatePlan).toHaveBeenCalledTimes(2)
    expect(mockedGetTsDocSignatureFromContext).toHaveBeenCalledTimes(1)

    expect(mockedExecuteJsDocUpdatePlan.mock.calls[1]?.[0]).toMatchObject({
      retry: {
        attempt: 1,
        missingSymboldentity: [createIdentity('Missing')],
      },
    })
  })

  it('keeps the original plan when retry result does not contain missing symbols', async () => {
    const originalPlan = createPlan('User')
    const retryPlan = createPlan('Other')

    mockedGetTsDocSignatureFromContext.mockReturnValueOnce(
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      new Set([toIdentityKey(originalPlan[0]!.identity)]),
    )
    mockedExecuteJsDocUpdatePlan
      .mockReturnValueOnce(Effect.succeed(originalPlan))
      .mockReturnValueOnce(Effect.succeed(retryPlan))

    mockedValidateJsDocUpdatePlan
      .mockReturnValueOnce({
        isValid: false,
        diff: [createIdentity('Missing')],
      })
      .mockReturnValueOnce({
        isValid: true,
      })

    const result = await run()

    expect(result).toEqual(originalPlan)
    expect(mockedGetTsDocSignatureFromContext).toHaveBeenCalledTimes(1)
  })

  it('adds matching missing symbols to the original plan', async () => {
    const originalPlan = createPlan('User')
    const missingPlan = createPlan('Missing')
    const unrelatedPlan = createPlan('Other')

    mockedGetTsDocSignatureFromContext.mockReturnValueOnce(
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      new Set([toIdentityKey(originalPlan[0]!.identity)]),
    )
    mockedExecuteJsDocUpdatePlan
      .mockReturnValueOnce(Effect.succeed(originalPlan))
      .mockReturnValueOnce(Effect.succeed([...missingPlan, ...unrelatedPlan] as JsDocUpdatePlan))

    mockedValidateJsDocUpdatePlan
      .mockReturnValueOnce({
        isValid: false,
        diff: [createIdentity('Missing')],
      })
      .mockReturnValueOnce({
        isValid: true,
      })

    const result = await run()

    expect(result).toEqual([...originalPlan, ...missingPlan])
    expect(mockedGetTsDocSignatureFromContext).toHaveBeenCalledTimes(1)
  })

  it('handles multiple missing symbols', async () => {
    const originalPlan = createPlan('User')
    const missingA = createPlanItem('MissingA')
    const missingB = createPlanItem('MissingB')
    const unrelated = createPlanItem('Other')

    mockedGetTsDocSignatureFromContext.mockReturnValueOnce(
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      new Set([toIdentityKey(originalPlan[0]!.identity)]),
    )
    mockedExecuteJsDocUpdatePlan
      .mockReturnValueOnce(Effect.succeed(originalPlan))
      .mockReturnValueOnce(
        Effect.succeed([missingA, missingB, unrelated] as unknown as JsDocUpdatePlan),
      )

    mockedValidateJsDocUpdatePlan
      .mockReturnValueOnce({
        isValid: false,
        diff: [createIdentity('MissingA'), createIdentity('MissingB')],
      })
      .mockReturnValueOnce({
        isValid: true,
      })

    const result = await run()

    expect(result).toEqual([...originalPlan, missingA, missingB])
    expect(mockedGetTsDocSignatureFromContext).toHaveBeenCalledTimes(1)
  })

  it('retries at most five times', async () => {
    mockedExecuteJsDocUpdatePlan.mockReturnValue(Effect.succeed(createPlan('User')))

    mockedValidateJsDocUpdatePlan.mockReturnValue({
      isValid: false,
      diff: [createIdentity('Missing')],
    })

    const result = await runQAWithResult(buildJsDocUpdatePlanWithRetry(context, fileResult))

    expect(mockedExecuteJsDocUpdatePlan).toHaveBeenCalledTimes(5)
    expect(mockedValidateJsDocUpdatePlan).toHaveBeenCalledTimes(5)
    expect(mockedGetTsDocSignatureFromContext).toHaveBeenCalledTimes(1)
    expect(result._tag).toBe('Failure')
  })

  it('fails with UpdateError after maximum retries', async () => {
    mockedValidateJsDocUpdatePlan.mockReturnValue({
      isValid: false,
      diff: [createIdentity('Missing')],
    })

    const result = await runQAWithResult(buildJsDocUpdatePlanWithRetry(context, fileResult))

    expect(result._tag).toBe('Failure')

    if (result._tag === 'Failure') {
      expect(result.failure).toBeDefined()
    }
  })

  it('writes the plan to a file when debug dump is enabled', async () => {
    const plan = createPlan('User')

    mockedGetTsDocSignatureFromContext.mockReturnValueOnce(
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      new Set([toIdentityKey(plan[0]!.identity)]),
    )
    mockedExecuteJsDocUpdatePlan.mockReturnValue(Effect.succeed(plan))

    const option = {
      debugInfo: {
        JsDocUpdatePlan: true,
        DumpToFile: true,
      },
    } as UpdateOptions

    const result = await run(context, option)

    expect(result).toEqual(plan)

    expect(mockedWriteStringToFile).toHaveBeenCalledWith(
      './log/JsDocUpdatePlan.txt',
      JSON.stringify(plan, null, 2),
      {
        flag: 'a',
      },
    )
  })

  it('prints the plan when debug is enabled without dump to file', async () => {
    const consoleDirSpy = vi.spyOn(console, 'dir').mockImplementation(() => undefined)

    const plan = createPlan('User')

    mockedExecuteJsDocUpdatePlan.mockReturnValue(Effect.succeed(plan))

    const option = {
      debugInfo: {
        JsDocUpdatePlan: true,
        DumpToFile: false,
      },
    } as UpdateOptions

    await run(context, option)

    expect(consoleDirSpy).toHaveBeenCalledWith(plan, {
      depth: null,
    })

    consoleDirSpy.mockRestore()
  })

  it('does not write or print the plan when debug is disabled', async () => {
    const consoleDirSpy = vi.spyOn(console, 'dir').mockImplementation(() => undefined)

    await run()

    expect(mockedWriteStringToFile).not.toHaveBeenCalled()
    expect(consoleDirSpy).not.toHaveBeenCalled()

    consoleDirSpy.mockRestore()
  })

  it('preserves retry context from the previous attempt', async () => {
    const initialPlan = createPlan('User')

    mockedExecuteJsDocUpdatePlan
      .mockReturnValueOnce(Effect.succeed(initialPlan))
      .mockReturnValueOnce(Effect.succeed(initialPlan))

    mockedValidateJsDocUpdatePlan
      .mockReturnValueOnce({
        isValid: false,
        diff: [createIdentity('Missing')],
      })
      .mockReturnValueOnce({
        isValid: true,
      })

    await run()

    expect(mockedExecuteJsDocUpdatePlan.mock.calls[1]?.[0]).toMatchObject({
      retry: {
        attempt: 1,
        missingSymboldentity: [createIdentity('Missing')],
      },
    })
  })
})
