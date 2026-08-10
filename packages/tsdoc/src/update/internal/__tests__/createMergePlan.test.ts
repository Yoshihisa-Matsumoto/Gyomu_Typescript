/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { Effect } from 'effect'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SignatureId, SymbolId } from '@gyomu/schema/typescript'
import { createMergePlan } from '../createMergePlan.js'
import { analyzeProtectedSection } from '../analyzeProtectedSection.js'
import type { FileAnalysisContext } from '@gyomu/schema/typescript'
import type { JsDocUpdatePlan } from '@gyomu/ai-compiler/jsdoc-update'

vi.mock('../analyzeProtectedSection.js', () => ({
  analyzeProtectedSection: vi.fn(),
}))

const mockedAnalyzeProtectedSection = vi.mocked(analyzeProtectedSection)

const symbolId = SymbolId('User')
const symbolIdentity = {
  signatureId: SignatureId('property'),
  symbolId,
}

const fileResult = {
  analysis: {
    path: '/src/User.ts',
  },
} as any as FileAnalysisContext

const createPlan = (overrides: Partial<JsDocUpdatePlan> = []): JsDocUpdatePlan =>
  ({
    identity: symbolIdentity,
    summary: {
      confidence: 0.9,
      action: {
        type: 'replace',
        value: 'User summary',
      },
    },
    returns: {
      confidence: 0.8,
      action: {
        type: 'replace',
        value: 'User result',
      },
    },
    params: [],
    tags: [],
    ...overrides,
  }) as any

const run = async (plan: JsDocUpdatePlan) => Effect.runPromise(createMergePlan(fileResult, [plan]))

describe('createMergePlan', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedAnalyzeProtectedSection.mockReturnValue([])
  })

  it('creates a merge plan without protected sections', async () => {
    const plan = createPlan({
      params: [
        {
          name: 'id',
          sortOrder: 0,
          confidence: 0.7,
          action: {
            type: 'replace',
            value: 'User id',
          },
        },
      ],
      tags: [
        {
          tag: 'remarks',
          target: 'remarks',
          sortOrder: 0,
          confidence: 0.6,
          action: {
            type: 'replace',
            value: 'Additional information',
          },
        },
      ],
    } as any)

    const [result] = await run(plan)

    expect(result).toMatchObject({
      target: symbolIdentity,
      summary: {
        type: 'replace',
        value: 'User summary',
      },
      returns: {
        type: 'replace',
        value: 'User result',
      },
      params: [
        {
          name: 'id',
          sortOrder: 0,
          action: {
            type: 'replace',
            value: 'User id',
          },
        },
      ],
      tags: [
        {
          tag: 'remarks',
          sortOrder: 0,
          action: {
            type: 'replace',
            value: 'Additional information',
          },
        },
      ],
      conflicts: [],
      confidence: 0.6,
      averageConfidence: (0.9 + 0.8 + 0.7 + 0.6) / 4,
    })
  })

  it('preserves summary and returns protected sections', async () => {
    mockedAnalyzeProtectedSection.mockReturnValue([
      {
        identity: symbolIdentity,
        protectedSections: [
          {
            targetSection: 'summary',
          },
          {
            targetSection: 'returns',
          },
        ],
      },
    ] as any)

    const [result] = await run(createPlan())

    expect(result!.summary).toEqual({
      type: 'preserve',
    })

    expect(result!.returns).toEqual({
      type: 'preserve',
    })
  })

  it('preserves a protected parameter', async () => {
    mockedAnalyzeProtectedSection.mockReturnValue([
      {
        identity: symbolIdentity,
        protectedSections: [
          {
            targetSection: 'param:id',
          },
        ],
      },
    ] as any)

    const [result] = await run(
      createPlan({
        params: [
          {
            name: 'id',
            sortOrder: 0,
            confidence: 0.8,
            action: {
              type: 'replace',
              value: 'User id',
            },
          },
        ],
      } as any),
    )

    expect(result!.params).toEqual([
      {
        name: 'id',
        sortOrder: 0,
        action: {
          type: 'preserve',
        },
      },
    ])
  })

  it('preserves a protected tag', async () => {
    mockedAnalyzeProtectedSection.mockReturnValue([
      {
        identity: symbolIdentity,
        protectedSections: [
          {
            targetSection: 'tag:remarks',
          },
        ],
      },
    ] as any)

    const [result] = await run(
      createPlan({
        tags: [
          {
            tag: 'remarks',
            target: 'remarks',
            sortOrder: 0,
            confidence: 0.8,
            action: {
              type: 'replace',
              value: 'new remarks',
            },
          },
        ],
      } as any),
    )

    expect(result!.tags).toEqual(
      expect.arrayContaining([
        {
          tag: 'remarks',
          sortOrder: 0,
          action: {
            type: 'preserve',
          },
        },
      ]),
    )
  })

  it('keeps the original action when a protected section does not match', async () => {
    mockedAnalyzeProtectedSection.mockReturnValue([
      {
        identity: symbolIdentity,
        protectedSections: [
          {
            targetSection: 'summary',
          },
        ],
      },
    ] as any)

    const [result] = await run(
      createPlan({
        returns: {
          confidence: 0.8,
          action: {
            type: 'replace',
            value: 'result',
          },
        },
        params: [
          {
            name: 'id',
            sortOrder: 0,
            confidence: 0.8,
            action: {
              type: 'replace',
              value: 'id',
            },
          },
        ],
        tags: [
          {
            tag: 'remarks',
            target: 'remarks',
            sortOrder: 0,
            confidence: 0.8,
            action: {
              type: 'replace',
              value: 'remarks',
            },
          },
        ],
      } as any),
    )

    expect(result!.returns).toEqual({
      type: 'replace',
      value: 'result',
    })

    expect(result!.params[0]?.action).toEqual({
      type: 'replace',
      value: 'id',
    })

    expect(result!.tags[0]?.action).toEqual({
      type: 'replace',
      value: 'remarks',
    })
  })

  it('supports delete and preserve parameter actions', async () => {
    const [result] = await run(
      createPlan({
        params: [
          {
            name: 'id',
            sortOrder: 0,
            confidence: 0.8,
            action: {
              type: 'delete',
            },
          },
          {
            name: 'name',
            sortOrder: 1,
            confidence: 0.7,
            action: {
              type: 'preserve',
            },
          },
        ],
      } as any),
    )

    expect(result!.params).toEqual([
      {
        name: 'id',
        sortOrder: 0,
        action: {
          type: 'delete',
        },
      },
      {
        name: 'name',
        sortOrder: 1,
        action: {
          type: 'preserve',
        },
      },
    ])
  })

  it('keeps the minimum confidence and calculates average confidence', async () => {
    const [result] = await run(
      createPlan({
        params: [
          {
            name: 'id',
            sortOrder: 0,
            confidence: 0.3,
            action: {
              type: 'preserve',
            },
          },
          {
            name: 'name',
            sortOrder: 1,
            confidence: 0.9,
            action: {
              type: 'preserve',
            },
          },
        ],
        tags: [
          {
            tag: 'remarks',
            target: 'remarks',
            sortOrder: 0,
            confidence: 0.6,
            action: {
              type: 'preserve',
            },
          },
        ],
      } as any),
    )

    expect(result!.confidence).toBe(0.3)

    expect(result!.averageConfidence).toBe((0.9 + 0.8 + 0.3 + 0.9 + 0.6) / 5)
  })

  it('adds missing protected JSDoc sections as preserve tags', async () => {
    mockedAnalyzeProtectedSection.mockReturnValue([
      {
        identity: symbolIdentity,
        protectedSections: [
          {
            targetSection: 'remarks',
          },
        ],
      },
    ] as any)

    const [result] = await run(createPlan())

    expect(result!.tags).toContainEqual({
      tag: {
        kind: 'remarks',
        key: null,
      },
      sortOrder: 99,
      action: {
        type: 'preserve',
      },
    })
  })

  it('adds missing protected tag sections as preserve tags', async () => {
    mockedAnalyzeProtectedSection.mockReturnValue([
      {
        identity: symbolIdentity,
        protectedSections: [
          {
            targetSection: 'tag:remarks',
          },
        ],
      },
    ] as any)

    const [result] = await run(createPlan())

    expect(result!.tags).toContainEqual({
      tag: {
        kind: 'remarks',
        key: null,
      },
      sortOrder: 99,
      action: {
        type: 'preserve',
      },
    })
  })

  it('uses other with key for unknown protected sections', async () => {
    mockedAnalyzeProtectedSection.mockReturnValue([
      {
        identity: symbolIdentity,
        protectedSections: [
          {
            targetSection: 'custom-section',
          },
        ],
      },
    ] as any)

    const [result] = await run(createPlan())

    expect(result!.tags).toContainEqual({
      tag: {
        kind: 'other',
        key: 'custom-section',
      },
      sortOrder: 99,
      action: {
        type: 'preserve',
      },
    })
  })

  it('does not add a protected section when the tag already exists', async () => {
    mockedAnalyzeProtectedSection.mockReturnValue([
      {
        identity: symbolIdentity,
        protectedSections: [
          {
            targetSection: 'remarks',
          },
        ],
      },
    ] as any)

    const [result] = await run(
      createPlan({
        tags: [
          {
            tag: 'remarks',
            target: 'remarks',
            sortOrder: 0,
            confidence: 0.8,
            action: {
              type: 'replace',
              value: 'remarks',
            },
          },
        ],
      } as any),
    )

    expect(result!.tags).toHaveLength(1)
    expect(result!.tags[0]?.action).toEqual({
      type: 'replace',
      value: 'remarks',
    })
  })

  it('ignores protected sections belonging to another symbol', async () => {
    mockedAnalyzeProtectedSection.mockReturnValue([
      {
        identity: {
          signatureId: SignatureId('other'),
          symbolId: SymbolId('Other'),
        },
        protectedSections: [
          {
            targetSection: 'summary',
          },
        ],
      },
    ] as any)

    const [result] = await run(createPlan())

    expect(result!.summary).toEqual({
      type: 'replace',
      value: 'User summary',
    })
  })

  it('returns an UpdateError when protected section analysis fails', async () => {
    mockedAnalyzeProtectedSection.mockImplementation(() => {
      throw new Error('analysis failed')
    })

    const effect = createMergePlan(fileResult, [createPlan()])

    const result = await Effect.runPromiseExit(effect)

    expect(result._tag).toBe('Failure')
  })
})
