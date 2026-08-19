import { Node } from 'ts-morph'
import { analyzeExpression } from './analyzeExpression.js'
import { analyzeStatement } from './analyzeStatement.js'
import type { CaseOrDefaultClause, SwitchStatement } from 'ts-morph'
import type {
  ChildAnalysisArg,
  FunctionBodyStatementAnalysisResult,
  FunctionBodySwitchClauseAnalysisResult,
  FunctionLikeNodeType,
} from '../../types.js'

export const analyzeSwitchStatement = (
  args: ChildAnalysisArg<FunctionLikeNodeType>,
  statement: SwitchStatement,
): FunctionBodyStatementAnalysisResult => {
  const expressionResult = analyzeExpression({ ...args, node: statement.getExpression() })
  const caseBlocks = statement
    .getCaseBlock()
    .getClauses()
    .map((clause) => analyzeSwitchCaseClause(args, clause))

  return {
    dependencies: [
      ...expressionResult.dependencies,
      ...caseBlocks.map((c) => c.dependencies).flat(),
    ],
    reservedNames: [
      ...expressionResult.reservedNames,
      ...caseBlocks.map((c) => c.reservedNames).flat(),
    ],
    elements: [
      {
        kind: 'switch',
        expression: expressionResult.element,
        children: caseBlocks.map((c) => c.element),
      },
    ],
  }
}

const analyzeSwitchCaseClause = (
  args: ChildAnalysisArg<FunctionLikeNodeType>,
  clause: CaseOrDefaultClause,
): FunctionBodySwitchClauseAnalysisResult => {
  const statementsResult = clause
    .getStatements()
    .map((statement) => analyzeStatement(args, statement))
    .flat()

  if (Node.isCaseClause(clause)) {
    const expressionResult = analyzeExpression({ ...args, node: clause.getExpression() })
    return {
      element: {
        kind: 'switch-case',
        expression: expressionResult.element,
        children: statementsResult.map((s) => s.elements).flat(),
      },
      dependencies: [
        ...expressionResult.dependencies,
        ...statementsResult.map((s) => s.dependencies).flat(),
      ],
      reservedNames: [
        ...expressionResult.reservedNames,
        ...statementsResult.map((s) => s.reservedNames).flat(),
      ],
    }
  } else {
    return {
      element: { kind: 'switch-default', children: statementsResult.map((s) => s.elements).flat() },
      dependencies: [...statementsResult.map((s) => s.dependencies).flat()],
      reservedNames: [...statementsResult.map((s) => s.reservedNames).flat()],
    }
  }
}
