import { describe, expect, it, vi } from 'vitest'
import { SignatureId, SymbolId } from '@gyomu/schema/typescript'
import { toIdentityKey } from '@gyomu/schema/schemas/typescript'
import {
  getTsDocSignatureFromContext,
  validateJsDocUpdatePlan,
} from '../validateJsDocUpdatePlan.js'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'
import type { JsDocUpdatePlan, TsDocFileContext } from '@gyomu/ai-compiler/jsdoc-update'

const createIdentity = (name: string): SymbolIdentity => ({
  signatureId: SignatureId(`signature:${name}`),
  symbolId: SymbolId(name),
})

const createPlan = (...names: Array<string>): JsDocUpdatePlan =>
  names.map((name) => ({
    identity: createIdentity(name),
  })) as unknown as JsDocUpdatePlan

const createContext = (
  symbols: Array<{
    name: string
    children?: Array<unknown>
  }>,
): TsDocFileContext =>
  ({
    symbols: symbols.map((symbol) => ({
      target: createIdentity(symbol.name),
      children: symbol.children,
    })),
  }) as any as TsDocFileContext

describe('validateJsDocUpdatePlan', () => {
  it('returns valid when context and plan contain the same symbols', () => {
    const context = createContext([{ name: 'User' }, { name: 'Service' }])

    const plans = createPlan('User', 'Service')

    expect(validateJsDocUpdatePlan(context, plans)).toEqual({
      isValid: true,
    })
  })

  it('returns valid for empty context and empty plan', () => {
    const context = createContext([])

    expect(validateJsDocUpdatePlan(context, [])).toEqual({
      isValid: true,
    })
  })

  it('returns missing context symbols as diff', () => {
    const context = createContext([{ name: 'User' }, { name: 'Service' }])

    const plans = createPlan('User')

    const result = validateJsDocUpdatePlan(context, plans)

    expect(result).toEqual({
      isValid: false,
      diff: [createIdentity('Service')],
    })
  })

  it('logs plan-only symbols', () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    const context = createContext([{ name: 'User' }])

    const plans = createPlan('User', 'Extra')

    const result = validateJsDocUpdatePlan(context, plans)

    expect(result).toEqual({
      isValid: true,
    })

    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('only exists on Plan'))

    consoleLogSpy.mockRestore()
  })

  it('returns only context-only symbols when both sides differ', () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    const context = createContext([{ name: 'User' }, { name: 'Service' }])

    const plans = createPlan('User', 'Extra')

    const result = validateJsDocUpdatePlan(context, plans)

    expect(result).toEqual({
      isValid: false,
      diff: [createIdentity('Service')],
    })

    expect(consoleLogSpy).toHaveBeenCalled()

    consoleLogSpy.mockRestore()
  })

  it('returns all missing symbols when multiple context symbols are missing', () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    const context = createContext([{ name: 'User' }, { name: 'Service' }, { name: 'Repository' }])

    const plans = createPlan('User')

    const result = validateJsDocUpdatePlan(context, plans)

    expect(result).toEqual({
      isValid: false,
      diff: [createIdentity('Service'), createIdentity('Repository')],
    })

    consoleLogSpy.mockRestore()
  })
})

describe('getTsDocSignatureFromContext', () => {
  it('returns identities of top-level symbols', () => {
    const context = createContext([{ name: 'User' }, { name: 'Service' }])

    const result = getTsDocSignatureFromContext(context)

    expect(result).toEqual(
      new Set([toIdentityKey(createIdentity('User')), toIdentityKey(createIdentity('Service'))]),
    )
  })

  it('includes documentable child members', () => {
    const context = createContext([
      {
        name: 'User',
        children: [
          {
            documentable: true,
            target: createIdentity('User.name'),
          },
        ],
      },
    ])

    const result = getTsDocSignatureFromContext(context)

    expect(result).toEqual(
      new Set([toIdentityKey(createIdentity('User')), toIdentityKey(createIdentity('User.name'))]),
    )
  })

  it('ignores children with documentable false', () => {
    const context = createContext([
      {
        name: 'User',
        children: [
          {
            documentable: false,
            target: createIdentity('User.name'),
          },
        ],
      },
    ])

    const result = getTsDocSignatureFromContext(context)

    expect(result).toEqual(new Set([toIdentityKey(createIdentity('User'))]))
  })

  it('ignores children with undefined documentable', () => {
    const context = createContext([
      {
        name: 'User',
        children: [
          {
            target: createIdentity('User.name'),
          },
        ],
      },
    ])

    const result = getTsDocSignatureFromContext(context)

    expect(result).toEqual(new Set([toIdentityKey(createIdentity('User'))]))
  })

  it('does not recurse beyond depth two', () => {
    const context = createContext([
      {
        name: 'User',
        children: [
          {
            documentable: true,
            target: createIdentity('User.profile'),
            children: [
              {
                documentable: true,
                target: createIdentity('User.profile.name'),
                children: [
                  {
                    documentable: true,
                    target: createIdentity('User.profile.name.value'),
                    children: [
                      {
                        documentable: true,
                        target: createIdentity('User.profile.name.value.deep'),
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ])

    const result = getTsDocSignatureFromContext(context)

    expect(result).toEqual(
      new Set([
        toIdentityKey(createIdentity('User')),
        toIdentityKey(createIdentity('User.profile')),
        toIdentityKey(createIdentity('User.profile.name')),
        toIdentityKey(createIdentity('User.profile.name.value')),
      ]),
    )

    expect(result.has(toIdentityKey(createIdentity('User.profile.name.value.deep')))).toBe(false)
  })

  it('does not recurse when children are absent', () => {
    const context = createContext([
      {
        name: 'User',
      },
    ])

    expect(getTsDocSignatureFromContext(context)).toEqual(
      new Set([toIdentityKey(createIdentity('User'))]),
    )
  })

  it('ignores non-documentable members but still processes other siblings', () => {
    const context = createContext([
      {
        name: 'User',
        children: [
          {
            documentable: false,
            target: createIdentity('ignored'),
          },
          {
            documentable: true,
            target: createIdentity('included'),
          },
        ],
      },
    ])

    const result = getTsDocSignatureFromContext(context)

    expect(result).toEqual(
      new Set([toIdentityKey(createIdentity('User')), toIdentityKey(createIdentity('included'))]),
    )
  })

  it('deduplicates identical symbol identities', () => {
    const identity = createIdentity('User')

    const context = {
      symbols: [
        {
          target: identity,
        },
        {
          target: identity,
        },
      ],
    } as any as TsDocFileContext

    const result = getTsDocSignatureFromContext(context)

    expect(result).toEqual(new Set([toIdentityKey(identity)]))
  })
})
