import { analyzeStatement } from './analyzeStatement.js'
import type { Block } from 'ts-morph'
import type {
  ChildAnalysisArg,
  FunctionBodyStatementAnalysisResult,
  FunctionLikeNodeType,
} from '../../types.js'

export const analyzeBlockStatement = (
  args: ChildAnalysisArg<FunctionLikeNodeType>,
  statement: Block,
): FunctionBodyStatementAnalysisResult => {
  const target = statement
    .getStatements()
    .map((statement) => analyzeStatement(args, statement))
    .flat()

  return {
    dependencies: target.map((t) => t.dependencies).flat(),
    reservedNames: target.map((t) => t.reservedNames).flat(),
    elements: [
      {
        kind: 'block',
        children: target.map((t) => t.elements).flat(),
      },
    ],
  }
}
