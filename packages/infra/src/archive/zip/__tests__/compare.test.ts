/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { describe, expect, it, vi } from 'vitest'
import { Effect, Layer, Ref, Stream } from 'effect'
import { makeRunner } from '@gyomu/schema/effect'
import {
  filterDiff,
  handleMissingFileInComparison,
  internalCompareFileEntry,
  isComparisionExcludeTarget,
  shouldRunGitDiff,
} from '../internals/compare.js' // パス調整
import { MainLayer, PlatformLayer } from '../../../layer.js'
import type {
  FileNameExclusionRule,
  InterimOutputType,
  ZipCompareOption,
} from '../internals/compare.js'
import type { ZipEntryItem } from '../internals/read.js'
import type { ZipFileEntryItem } from '../../common.js'

const createMockStream = (text: string) => Stream.fromIterable([new TextEncoder().encode(text)])

describe('filterDiff', () => {
  it('ruleなしならそのまま返す', () => {
    const input = {
      diff: [{ path: 'a', sourceValue: '1', destinationValue: '2' }],
      diffExist: true,
    }

    const result = filterDiff(input, undefined)

    expect(result.diffDetailList.length).toBe(1)
    expect(result.originalNumberOfDiff).toBe(1)
  })

  it('条件一致するものを除外する', () => {
    const input = {
      diff: [{ path: 'a', sourceValue: '1', destinationValue: '2' }],
      diffExist: true,
    }

    const rule = {
      filePathRegExpression: '.*',
      type: 'Different',
      criteria: [
        {
          pathRegExpression: 'a',
          sourceValue: '1',
        },
      ],
    }

    const result = filterDiff(input, rule as any)

    expect(result.diffDetailList.length).toBe(0)
    expect(result.originalNumberOfDiff).toBe(1)
  })
})

describe('shouldRunGitDiff', () => {
  it('diffが多い場合はtrue', () => {
    const diff = Array.from({ length: 6 }).map(() => ({
      path: 'a',
      sourceValue: '1',
      destinationValue: '2',
    }))

    expect(shouldRunGitDiff(diff as any, 6, { diff, diffExist: true } as any)).toBe(true)
  })

  it('長文が含まれる場合はtrue', () => {
    const diff = [
      {
        path: 'a',
        sourceValue: 'x'.repeat(101),
        destinationValue: 'b',
      },
    ]

    expect(shouldRunGitDiff(diff as any, 1, { diff, diffExist: true } as any)).toBe(true)
  })

  it('diffなしでもdiffExist=trueならtrue', () => {
    expect(shouldRunGitDiff([], 0, { diff: [], diffExist: true } as any)).toBe(true)
  })
})

describe('isComparisionExcludeTarget', () => {
  const rule: FileNameExclusionRule = {
    folder: [
      {
        type: 'exclude',
        target: ['ignore.txt'],
      },
    ],
  }

  it('exclude対象ならtrue', () => {
    const result = isComparisionExcludeTarget('folder/ignore.txt', rule, ['folder'])

    expect(result).toBe(true)
  })

  it('対象外ならfalse', () => {
    const result = isComparisionExcludeTarget('folder/keep.txt', rule, ['folder'])

    expect(result).toBe(false)
  })
})
const nodeTestLayer = Layer.mergeAll(PlatformLayer, MainLayer)
const runNodeWithEnvOrThrow = makeRunner(nodeTestLayer)
describe('handleMissingFileInComparison', () => {
  it('Sourceのみ存在するファイルを追加する', async () => {
    const state = await Effect.runPromise(
      Ref.make({
        sourceFiles: new Map(),
        destinationFiles: new Map(),
        results: [],
      } as InterimOutputType),
    )

    const file: ZipEntryItem = {
      _tag: 'zip',
      crc32: 1234,
      uncompressedSize: 1234,
      path: 'a.txt',
      isDirectory: false,
      openStream: () => createMockStream('test abc'),
    }

    const result = await runNodeWithEnvOrThrow(
      handleMissingFileInComparison(file, true, state, {
        resultPath: '/tmp',
      } as any),
    )

    const final = await Effect.runPromise(Ref.get(result))

    expect(final.results).toEqual([{ path: 'a.txt', diff: 'Only in Source' }])
  })
})

describe('internalCompareFileEntry', () => {
  it('差分があれば結果に追加される', async () => {
    const state = await Effect.runPromise(
      Ref.make<InterimOutputType>({
        sourceFiles: new Map(),
        destinationFiles: new Map(),
        results: [],
      }),
    )

    const source: ZipFileEntryItem = {
      path: 'a.txt',
      isDirectory: false,
      uncompressedSize: 1,
      crc32: 1,
      _tag: 'zip',
      openStream: () => createMockStream('abc'),
    }

    const dest: ZipFileEntryItem = {
      path: 'a.txt',
      isDirectory: false,
      uncompressedSize: 2,
      crc32: 2,
      _tag: 'zip',
      openStream: () => createMockStream('abc'),
    }

    const compareFunc = vi.fn().mockReturnValue(
      Effect.succeed({
        diff: [],
        diffExist: true,
      }),
    )

    const result = await runNodeWithEnvOrThrow(
      internalCompareFileEntry(
        source,
        dest,
        state,
        { resultPath: '/tmp' } as ZipCompareOption,
        compareFunc,
      ),
    )

    const final = await runNodeWithEnvOrThrow(Ref.get(result))

    expect(final.results.length).toBe(1)
    expect(final.results[0]!.diff!).toBe('Different')
  })

  it('完全一致なら何もしない', async () => {
    const state = await Effect.runPromise(
      Ref.make<InterimOutputType>({
        sourceFiles: new Map(),
        destinationFiles: new Map(),
        results: [],
      }),
    )

    const file: ZipFileEntryItem = {
      path: 'a.txt',
      isDirectory: false,
      uncompressedSize: 1,
      crc32: 1,
      _tag: 'zip',
      openStream: () => createMockStream('abc'),
    }

    const result = await runNodeWithEnvOrThrow(
      internalCompareFileEntry(file, file, state, {
        resultPath: '/tmp',
      } as ZipCompareOption),
    )

    const final = await Effect.runPromise(Ref.get(result))

    expect(final.results.length).toBe(0)
  })
})
