import { SyntaxKind } from 'ts-morph'
import { analyzeExpression } from './analyzeExpression.js'
import type { BinaryExpression, Expression } from 'ts-morph'
import type {
  ChildAnalysisArg,
  ExpressionAnalysisResult,
  FunctionLikeNodeType,
} from '../../types.js'
import type { AssignmentOperator } from '@gyomu/schema/schemas/typescript'

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
  throw new Error(`Unsupport Non Assignment Yet`)
}

function getAssignmentOperator(operator: SyntaxKind): AssignmentOperator | undefined {
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
