import { Node } from 'ts-morph'
import { analyzeExpression } from './analyzeExpression.js'
import { analyzeStatement, toFunctionBodyStatementAnalysisResult } from './analyzeStatement.js'
import { analyzeVariableDeclarationList } from './analyzeVariable.js'
import type { ForInStatement, ForOfStatement, ForStatement } from 'ts-morph'
import type {
  ChildAnalysisArg,
  FunctionBodyStatementAnalysisResult,
  FunctionLikeNodeType,
} from '../../types.js'

export const analyzeForStatement = (
  args: ChildAnalysisArg<FunctionLikeNodeType>,
  statement: ForOfStatement | ForInStatement,
): FunctionBodyStatementAnalysisResult => {
  const expressionResult = analyzeExpression({ ...args, node: statement.getExpression() })
  const bodyResult = analyzeStatement(args, statement.getStatement())

  const initializer = statement.getInitializer()
  let initializerResult: FunctionBodyStatementAnalysisResult
  if (Node.isVariableDeclarationList(initializer))
    initializerResult = analyzeVariableDeclarationList(args, initializer)
  else
    initializerResult = toFunctionBodyStatementAnalysisResult(
      analyzeExpression({ ...args, node: initializer }),
    )

  return {
    dependencies: [
      ...expressionResult.dependencies,
      ...bodyResult.dependencies,
      ...initializerResult.dependencies,
    ],
    reservedNames: [
      ...expressionResult.reservedNames,
      ...bodyResult.reservedNames,
      ...initializerResult.reservedNames,
    ],
    elements: [
      {
        kind: 'for',
        expression: expressionResult.element,
        initializer: initializerResult.elements,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        statement: bodyResult.elements[0]!,
        isAwait: Node.isForOfStatement(statement) ? statement.isAwaited() : false,
      },
    ],
  }
}

export const analyzeNormalForStatement = (
  args: ChildAnalysisArg<FunctionLikeNodeType>,
  statement: ForStatement,
): FunctionBodyStatementAnalysisResult => {
  const condition = statement.getCondition()
  const expressionResult = condition ? analyzeExpression({ ...args, node: condition }) : undefined
  const incrementor = statement.getIncrementor()
  const incrementorResult = incrementor
    ? analyzeExpression({ ...args, node: incrementor })
    : undefined
  const bodyResult = analyzeStatement(args, statement.getStatement())

  const initializer = statement.getInitializer()
  let initializerResult: FunctionBodyStatementAnalysisResult | undefined = undefined
  if (Node.isVariableDeclarationList(initializer))
    initializerResult = analyzeVariableDeclarationList(args, initializer)
  else if (Node.isExpression(initializer))
    initializerResult = toFunctionBodyStatementAnalysisResult(
      analyzeExpression({ ...args, node: initializer }),
    )

  return {
    dependencies: [
      ...(expressionResult?.dependencies ?? []),
      ...(initializerResult?.dependencies ?? []),
      ...(incrementorResult?.dependencies ?? []),
      ...bodyResult.dependencies,
    ],
    reservedNames: [
      ...(expressionResult?.reservedNames ?? []),
      ...(initializerResult?.reservedNames ?? []),
      ...(incrementorResult?.reservedNames ?? []),
      ...bodyResult.reservedNames,
    ],
    elements: [
      {
        kind: 'for',
        expression: expressionResult?.element,
        initializer: initializerResult?.elements ?? [],
        incrementor: incrementorResult?.element,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        statement: bodyResult.elements[0]!,
        isAwait: false,
      },
    ],
  }
}
