import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Effect } from 'effect'
import { ProjectRelativePath } from '@gyomu/schema/typescript'
import { PlatformLayer } from '@gyomu/infra'
import { loadFileAnalysisResult } from '../loadFileAnalysisResult.js'
import { loadFileAnalysis } from '../loadFileAnalysis.js'
import { analyzeFile } from '../analyzeFile.js'
import { buildIndex } from '../buildIndex.js'

import { AnalysisError } from '../error/AnalysisError.js'
import type { FileAnalysisMetadata } from '@gyomu/schema/typescript'
import type { FileAnalysis } from '@gyomu/schema/schemas/typescript'
import type { ProjectContext } from '../project/ProjectContext.js'

vi.mock('../loadFileAnalysis.js', () => ({
  loadFileAnalysis: vi.fn(),
}))

vi.mock('../analyzeFile.js', () => ({
  analyzeFile: vi.fn(),
}))

vi.mock('../buildIndex.js', () => ({
  buildIndex: vi.fn(),
}))

describe('loadFileAnalysisResult', () => {
  const context = { projectRoot: '' } as ProjectContext
  const sourceFile = ProjectRelativePath('src/index.ts')

  const analysis = {
    path: ProjectRelativePath(''),
    imports: [],
    exports: [],
    symbols: [],
  } as FileAnalysis
  const metadata = {} as FileAnalysisMetadata

  const analyzeResult = {
    analysis,
    metadata,
    transient: {
      dependencyCandidates: new Map(),
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns loaded analysis when cache exists', async () => {
    vi.mocked(loadFileAnalysis).mockReturnValue(Effect.succeed(analysis))
    vi.mocked(buildIndex).mockReturnValue(metadata)

    const result = await Effect.runPromise(
      loadFileAnalysisResult(context, sourceFile).pipe(Effect.provide(PlatformLayer)),
    )

    expect(result.created).toBe(false)

    expect(result.result.analysis).toBe(analysis)
    expect(result.result.metadata).toBe(metadata)
    expect(result.result.transient.dependencyCandidates.size).toBe(0)

    expect(loadFileAnalysis).toHaveBeenCalledWith(context, sourceFile)
    expect(buildIndex).toHaveBeenCalledWith(analysis)
    expect(analyzeFile).not.toHaveBeenCalled()
  })

  it('analyzes file when cache does not exist', async () => {
    vi.mocked(loadFileAnalysis).mockReturnValue(Effect.succeed(undefined))
    vi.mocked(analyzeFile).mockReturnValue(Effect.succeed(analyzeResult))

    const result = await Effect.runPromise(
      loadFileAnalysisResult(context, sourceFile).pipe(Effect.provide(PlatformLayer)),
    )

    expect(result.created).toBe(true)
    expect(result.result).toBe(analyzeResult)

    expect(buildIndex).not.toHaveBeenCalled()
    expect(analyzeFile).toHaveBeenCalledWith(context, sourceFile, undefined)
  })

  it('falls back to analyzeFile when loadFileAnalysis fails', async () => {
    vi.mocked(loadFileAnalysis).mockReturnValue(
      Effect.fail(
        new AnalysisError({
          cause: new Error('abc'),
          filePath: 'test',
          message: 'load failed',
          phase: 'analysis',
        }),
      ),
    )
    vi.mocked(analyzeFile).mockReturnValue(Effect.succeed(analyzeResult))

    const result = await Effect.runPromise(
      loadFileAnalysisResult(context, sourceFile).pipe(Effect.provide(PlatformLayer)),
    )

    expect(result.created).toBe(true)
    expect(result.result).toBe(analyzeResult)

    expect(buildIndex).not.toHaveBeenCalled()
    expect(analyzeFile).toHaveBeenCalledOnce()
  })

  it('passes options to analyzeFile', async () => {
    const option = {
      computeMetadataAndTransient: true,
    }

    vi.mocked(loadFileAnalysis).mockReturnValue(Effect.succeed(undefined))
    vi.mocked(analyzeFile).mockReturnValue(Effect.succeed(analyzeResult))

    await Effect.runPromise(
      loadFileAnalysisResult(context, sourceFile, option).pipe(Effect.provide(PlatformLayer)),
    )

    expect(analyzeFile).toHaveBeenCalledWith(context, sourceFile, option)
  })
})
