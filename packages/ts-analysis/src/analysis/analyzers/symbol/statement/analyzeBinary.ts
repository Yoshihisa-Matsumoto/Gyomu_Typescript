import { SyntaxKind } from 'ts-morph'
import { analyzeExpression } from './analyzeExpression.js'
import type { BinaryExpression, Expression } from 'ts-morph'
import type {
  ChildAnalysisArg,
  ExpressionAnalysisResult,
  FunctionLikeNodeType,
} from '../../types.js'
import type { AssignmentOperator, BinaryOperator } from '@gyomu/schema/schemas/typescript'

export const analyzeBinaryExpression = (
  args: ChildAnalysisArg<FunctionLikeNodeType | Expression>,
  expression: BinaryExpression,
): ExpressionAnalysisResult => {
  const left = analyzeExpression({ ...args, node: expression.getLeft() })
  const right = analyzeExpression({ ...args, node: expression.getRight() })
  const operator = expression.getOperatorToken()

  const assignmentOperator = getAssignmentOperator(operator.getKind())

  if (assignmentOperator) {
    // AssignmentAnalysis
    return {
      element: {
        kind: 'assignment',
        left: left.element,
        right: right.element,
        operator: assignmentOperator,
      },
      dependencies: [...left.dependencies, ...right.dependencies],
      reservedNames: [...left.reservedNames, ...right.reservedNames],
    }
  }
  const binaryOperator = getBinaryOperator(operator.getKind())
  if (binaryOperator) {
    return {
      element: {
        kind: 'binary',
        left: left.element,
        right: right.element,
        operator: binaryOperator,
      },
      dependencies: [...left.dependencies, ...right.dependencies],
      reservedNames: [...left.reservedNames, ...right.reservedNames],
    }
  }
  throw new Error(`Unsupport Non Assignment Yet`)
}

export function getAssignmentOperator(operator: SyntaxKind): AssignmentOperator | undefined {
  switch (operator) {
    case SyntaxKind.EqualsToken:
      return '='
    case SyntaxKind.PlusEqualsToken:
      return '+='
    case SyntaxKind.MinusEqualsToken:
      return '-='
    case SyntaxKind.AsteriskEqualsToken:
      return '*='
    case SyntaxKind.SlashEqualsToken:
      return '/='
    case SyntaxKind.PercentEqualsToken:
      return '%='
    case SyntaxKind.AsteriskAsteriskEqualsToken:
      return '**='
    case SyntaxKind.LessThanLessThanEqualsToken:
      return '<<='
    case SyntaxKind.GreaterThanGreaterThanEqualsToken:
      return '>>='
    case SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken:
      return '>>>='
    case SyntaxKind.AmpersandEqualsToken:
      return '&='
    case SyntaxKind.BarEqualsToken:
      return '|='
    case SyntaxKind.CaretEqualsToken:
      return '^='
    case SyntaxKind.AmpersandAmpersandEqualsToken:
      return '&&='
    case SyntaxKind.BarBarEqualsToken:
      return '||='
    case SyntaxKind.QuestionQuestionEqualsToken:
      return '??='
    default:
      return undefined
  }
}
export function getBinaryOperator(operator: SyntaxKind): BinaryOperator | undefined {
  switch (operator) {
    case SyntaxKind.EqualsEqualsToken:
      return '=='
    case SyntaxKind.ExclamationEqualsToken:
      return '!='
    case SyntaxKind.EqualsEqualsEqualsToken:
      return '==='
    case SyntaxKind.ExclamationEqualsEqualsToken:
      return '!=='
    case SyntaxKind.LessThanToken:
      return '<'
    case SyntaxKind.LessThanEqualsToken:
      return '<='
    case SyntaxKind.GreaterThanToken:
      return '>'
    case SyntaxKind.GreaterThanEqualsToken:
      return '>='
    case SyntaxKind.InKeyword:
      return 'in'
    case SyntaxKind.InstanceOfKeyword:
      return 'instanceof'
    case SyntaxKind.PlusToken:
      return '+'
    case SyntaxKind.MinusToken:
      return '-'
    case SyntaxKind.AsteriskToken:
      return '*'
    case SyntaxKind.SlashToken:
      return '/'
    case SyntaxKind.PercentToken:
      return '%'
    case SyntaxKind.AsteriskAsteriskToken:
      return '**'
    case SyntaxKind.LessThanLessThanToken:
      return '<<'
    case SyntaxKind.GreaterThanGreaterThanToken:
      return '>>'
    case SyntaxKind.GreaterThanGreaterThanGreaterThanToken:
      return '>>>'
    case SyntaxKind.AmpersandToken:
      return '&'
    case SyntaxKind.CaretToken:
      return '^'
    case SyntaxKind.BarToken:
      return '|'
    case SyntaxKind.AmpersandAmpersandToken:
      return '&&'
    case SyntaxKind.BarBarToken:
      return '||'
    case SyntaxKind.QuestionQuestionToken:
      return '??'
    default:
      return undefined
  }
}
