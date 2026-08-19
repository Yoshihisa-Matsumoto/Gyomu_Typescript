import { analyzeExpression } from './analyzeExpression.js'
import { analyzeStatement } from './analyzeStatement.js'
import type { WhileStatement } from 'ts-morph'
import type {
  ChildAnalysisArg,
  FunctionBodyStatementAnalysisResult,
  FunctionLikeNodeType,
} from '../../types.js'

export const analyzeWhileStatement = (
  args: ChildAnalysisArg<FunctionLikeNodeType>,
  statement: WhileStatement,
): FunctionBodyStatementAnalysisResult => {
  const expressionResult = analyzeExpression({ ...args, node: statement.getExpression() })
  const bodyResult = analyzeStatement(args, statement.getStatement())

  return {
    dependencies: [...expressionResult.dependencies, ...bodyResult.dependencies],
    reservedNames: [...expressionResult.reservedNames, ...bodyResult.reservedNames],
    elements: [
      {
        kind: 'while',
        expression: expressionResult.element,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        statement: bodyResult.elements[0]!,
      },
    ],
  }
}
