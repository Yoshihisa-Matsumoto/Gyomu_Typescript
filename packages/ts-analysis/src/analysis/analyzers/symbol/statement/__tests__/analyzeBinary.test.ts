import { SyntaxKind } from 'ts-morph'
import { describe, expect, it } from 'vitest'
import { getAssignmentOperator, getBinaryOperator } from '../analyzeBinary.js'

describe('getBinaryOperator', () => {
  it.each([
    [SyntaxKind.EqualsEqualsToken, '=='],
    [SyntaxKind.ExclamationEqualsToken, '!='],
    [SyntaxKind.EqualsEqualsEqualsToken, '==='],
    [SyntaxKind.ExclamationEqualsEqualsToken, '!=='],
    [SyntaxKind.LessThanToken, '<'],
    [SyntaxKind.LessThanEqualsToken, '<='],
    [SyntaxKind.GreaterThanToken, '>'],
    [SyntaxKind.GreaterThanEqualsToken, '>='],
    [SyntaxKind.InKeyword, 'in'],
    [SyntaxKind.InstanceOfKeyword, 'instanceof'],
    [SyntaxKind.PlusToken, '+'],
    [SyntaxKind.MinusToken, '-'],
    [SyntaxKind.AsteriskToken, '*'],
    [SyntaxKind.SlashToken, '/'],
    [SyntaxKind.PercentToken, '%'],
    [SyntaxKind.AsteriskAsteriskToken, '**'],
    [SyntaxKind.LessThanLessThanToken, '<<'],
    [SyntaxKind.GreaterThanGreaterThanToken, '>>'],
    [SyntaxKind.GreaterThanGreaterThanGreaterThanToken, '>>>'],
    [SyntaxKind.AmpersandToken, '&'],
    [SyntaxKind.CaretToken, '^'],
    [SyntaxKind.BarToken, '|'],
    [SyntaxKind.AmpersandAmpersandToken, '&&'],
    [SyntaxKind.BarBarToken, '||'],
    [SyntaxKind.QuestionQuestionToken, '??'],
  ] as const)('%s -> %s', (kind, expected) => {
    expect(getBinaryOperator(kind)).toBe(expected)
  })
})
describe('getAssignmentOperator', () => {
  it.each([
    [SyntaxKind.EqualsToken, '='],
    [SyntaxKind.PlusEqualsToken, '+='],
    [SyntaxKind.MinusEqualsToken, '-='],
    [SyntaxKind.AsteriskEqualsToken, '*='],
    [SyntaxKind.SlashEqualsToken, '/='],
    [SyntaxKind.PercentEqualsToken, '%='],
    [SyntaxKind.AsteriskAsteriskEqualsToken, '**='],
    [SyntaxKind.LessThanLessThanEqualsToken, '<<='],
    [SyntaxKind.GreaterThanGreaterThanEqualsToken, '>>='],
    [SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken, '>>>='],
    [SyntaxKind.AmpersandEqualsToken, '&='],
    [SyntaxKind.BarEqualsToken, '|='],
    [SyntaxKind.CaretEqualsToken, '^='],
    [SyntaxKind.AmpersandAmpersandEqualsToken, '&&='],
    [SyntaxKind.BarBarEqualsToken, '||='],
    [SyntaxKind.QuestionQuestionEqualsToken, '??='],
  ] as const)('%s -> %s', (kind, expected) => {
    expect(getAssignmentOperator(kind)).toBe(expected)
  })

  it('returns undefined for non-assignment operators', () => {
    expect(getAssignmentOperator(SyntaxKind.PlusToken)).toBeUndefined()
  })
})
