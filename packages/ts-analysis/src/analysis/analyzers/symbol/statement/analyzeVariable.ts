import { analyzeVariable } from '../variable/analyzeVariable.js'
import { analyzeExpression } from './analyzeExpression.js'
import type { VariableDeclaration, VariableDeclarationList, VariableStatement } from 'ts-morph'
import type {
  ChildAnalysisArg,
  FunctionBodyStatementAnalysisResult,
  FunctionLikeNodeType,
} from '../../types.js'
import type { FunctionBodyElement } from '@gyomu/schema/schemas/typescript'

export const analyzeVariableDeclarationList = (
  args: ChildAnalysisArg<FunctionLikeNodeType>,
  list: VariableDeclarationList,
): FunctionBodyStatementAnalysisResult => {
  return analyzeVariableDeclarationsInternal(args, list.getDeclarations())
}

export const analyzeVariableStatement = (
  args: ChildAnalysisArg<FunctionLikeNodeType>,
  statement: VariableStatement,
): FunctionBodyStatementAnalysisResult => {
  let variables = statement.getDeclarationList().getDeclarations()
  if (variables.length == 0) variables = statement.getDeclarations()
  return analyzeVariableDeclarationsInternal(args, variables)
}
const analyzeVariableDeclarationsInternal = (
  args: ChildAnalysisArg<FunctionLikeNodeType>,
  variables: Array<VariableDeclaration>,
): FunctionBodyStatementAnalysisResult => {
  const variablesResult = variables.map((variable) => {
    const initializer = variable.getInitializer()
    return {
      variable: analyzeVariable({ ...args, declaration: variable }),
      initializer: initializer ? analyzeExpression({ ...args, node: initializer }) : undefined,
    }
  })
  return {
    dependencies: [
      ...variablesResult.map((v) => v.variable.symbol.dependencyCandidates).flat(),
      ...variablesResult
        .map((v) => v.initializer?.dependencies)
        .filter((d) => !!d)
        .flat(),
    ],
    reservedNames: [
      ...variablesResult
        .map((v) => v.initializer?.reservedNames)
        .filter((v) => !!v)
        .flat(),
    ],
    elements: variablesResult.map(
      (v) =>
        ({
          kind: 'variable-declaration',
          symbol: v.variable.symbol,
          initializer: v.initializer?.element,
        }) satisfies FunctionBodyElement,
    ),
  }
}
