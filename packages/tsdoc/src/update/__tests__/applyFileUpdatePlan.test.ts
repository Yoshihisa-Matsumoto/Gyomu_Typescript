import { describe, expect, it } from 'vitest'
import { SignatureId, SymbolId } from '@gyomu/schema/typescript'
import { applyFileUpdatePlan } from '../applyFileUpdatePlan.js'
import type { FileUpdatePlan } from '../jsdoc/FileUpdatePlan.js'

describe('applyFileUpdatePlan', () => {
  it('should replace existing text (start != end)', () => {
    const source = 'function foo() {}'

    const plan: FileUpdatePlan = {
      edits: [
        {
          startOffset: 9,
          endOffset: 12, // "foo"
          symbol: {
            symbolId: SymbolId('foo'),
            signatureId: SignatureId('sig'),
          },
          newText: 'bar',
          startLine: 0,
          endLine: 0,
          indent: 0,
          declarationOrder: 0,
        },
      ],
    }

    const result = applyFileUpdatePlan(source, plan)

    expect(result).toBe('function bar() {}')
  })

  it('should insert text when start === end', () => {
    const source = 'function foo() {}'

    const plan: FileUpdatePlan = {
      edits: [
        {
          startOffset: 0,
          endOffset: 0,
          symbol: {
            symbolId: SymbolId('foo'),
            signatureId: SignatureId('sig'),
          },
          newText: '/** doc */\n',
          startLine: 0,
          endLine: 0,
          indent: 0,
          declarationOrder: 0,
        },
      ],
    }

    const result = applyFileUpdatePlan(source, plan)

    expect(result).toBe('/** doc */\nfunction foo() {}')
  })

  it('should apply multiple edits in correct order (reverse-safe)', () => {
    const source = 'function foo() { return 1 }'

    const plan: FileUpdatePlan = {
      edits: [
        {
          startOffset: 9,
          endOffset: 12, // foo
          symbol: {
            symbolId: SymbolId('foo'),
            signatureId: SignatureId('sig'),
          },
          newText: 'bar',
          startLine: 0,
          endLine: 0,
          indent: 0,
          declarationOrder: 0,
        },
        {
          startOffset: 24,
          endOffset: 25, // 1
          symbol: {
            symbolId: SymbolId('num'),
            signatureId: SignatureId('sig'),
          },
          newText: '42',
          startLine: 0,
          endLine: 0,
          indent: 0,
          declarationOrder: 0,
        },
      ],
    }

    const result = applyFileUpdatePlan(source, plan)

    expect(result).toBe('function bar() { return 42 }')
  })

  it('should not break when edits are already sorted randomly', () => {
    const source = 'function foo() { return 1 }'

    const plan: FileUpdatePlan = {
      edits: [
        {
          startOffset: 24,
          endOffset: 25,
          symbol: {
            symbolId: SymbolId('num'),
            signatureId: SignatureId('sig'),
          },
          newText: '42',
          startLine: 0,
          endLine: 0,
          indent: 0,
          declarationOrder: 0,
        },
        {
          startOffset: 9,
          endOffset: 12,
          symbol: {
            symbolId: SymbolId('foo'),
            signatureId: SignatureId('sig'),
          },
          newText: 'bar',
          startLine: 0,
          endLine: 0,
          indent: 0,
          declarationOrder: 0,
        },
      ],
    }

    const result = applyFileUpdatePlan(source, plan)

    expect(result).toBe('function bar() { return 42 }')
  })
})
