import { Node } from 'ts-morph'
import { analyzeStatement } from '../statement/analyzeStatement.js'
import { analyzeExpression } from '../statement/analyzeExpression.js'
import { analyzeGenericsParameters } from '../analyzeGenericsParameters.js'
import type {
  ArrowFunction,
  ConstructorDeclaration,
  FunctionDeclaration,
  FunctionExpression,
  FunctionTypeNode,
  MethodDeclaration,
  MethodSignature,
} from 'ts-morph'
import type {
  ChildAnalysisArg,
  GenericParameterAnalysisResult,
  MethodAnalysisResult,
} from '../../types.js'

/**
 * Analyzes the body statements of a function, method, or constructor declaration for dependency extraction.
 *
 * @param args The analysis context including the function node.
 *
 * @returns A result object containing the list of analyzed dependencies found within the function body.
 */

export const analyzeFunctionBody = (
  args: ChildAnalysisArg<
    | MethodSignature
    | FunctionTypeNode
    | MethodDeclaration
    | ConstructorDeclaration
    | FunctionDeclaration
    | ArrowFunction
    | FunctionExpression
  >,
): MethodAnalysisResult => {
  // console.log('analyzeFunctionBody', args2.name, args.node.getKindName())
  if (
    Node.isConstructorDeclaration(args.node) ||
    Node.isMethodDeclaration(args.node) ||
    Node.isFunctionDeclaration(args.node) ||
    Node.isArrowFunction(args.node) ||
    Node.isFunctionExpression(args.node)
  ) {
    // console.log('Constructor or Method')
    let genericsResult: GenericParameterAnalysisResult | undefined = undefined
    if (Node.isTypeParametered(args.node)) {
      genericsResult = analyzeGenericsParameters(args)
    }
    const body = args.node.getBody()
    if (Node.isBlock(body)) {
      const statementsResult = body
        .getStatements()
        .map((statement) =>
          analyzeStatement({ ...args, memberPath: [...args.memberPath, '$body'] }, statement),
        )
        .flat()
      // console.dir(statementsResult, { depth: 5 })
      return {
        dependencies: [
          ...statementsResult.map((s) => s.dependencies).flat(),
          ...(genericsResult?.dependencies ?? []),
        ],
        functionBody: { elements: statementsResult.map((s) => s.elements).flat() },
      }
    } else if (Node.isStatement(body)) {
      const bodyResult = analyzeStatement(args, body)
      return {
        dependencies: [...bodyResult.dependencies, ...(genericsResult?.dependencies ?? [])],
        functionBody: { elements: bodyResult.elements },
      }
    } else if (Node.isExpression(body)) {
      const expressionResult = analyzeExpression({ ...args, node: body })
      return {
        dependencies: [...expressionResult.dependencies, ...(genericsResult?.dependencies ?? [])],
        functionBody: { elements: [expressionResult.element] },
      }
    }
  }

  return {
    dependencies: [],
    functionBody: { elements: [] },
  }
}
