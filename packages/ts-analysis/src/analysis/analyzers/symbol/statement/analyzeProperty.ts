import { Node } from 'ts-morph'
import { analyzeExpression } from './analyzeExpression.js'
import type { ObjectLiteralElementLike } from 'ts-morph'
import type { ChildAnalysisArg, PropertyAnalysisResult } from '../../types.js'

/**
 * Analyzes a TypeScript Expression node to determine its type structure and dependencies, including support for effect schema identification and literal values.
 *
 * @param args The configuration object containing the expression node and analysis context.
 *
 * @returns A result object containing the analyzed type structure, dependencies, and reserved names.
 */
export const analyzeProperty = (
  args: ChildAnalysisArg<ObjectLiteralElementLike>,
): PropertyAnalysisResult => {
  const { node } = args

  if (Node.isPropertyAssignment(node)) {
    const valueResult = analyzeExpression({ ...args, node: node.getInitializer()! })
    return {
      property: {
        kind: 'property',
        name: node.getName(),
        value: valueResult.element,
      },
      dependencies: valueResult.dependencies,
      reservedNames: valueResult.reservedNames,
    }
  }
  if (Node.isShorthandPropertyAssignment(node)) {
    const identifierResult = analyzeExpression({ ...args, node: node.getNameNode() })
    return {
      property: {
        kind: 'property',
        name: node.getName(),
        value: identifierResult.element,
      },
      dependencies: identifierResult.dependencies,
      reservedNames: identifierResult.reservedNames,
    }
  }

  if (Node.isSpreadAssignment(node)) {
    const identifierResult = analyzeExpression({ ...args, node: node.getExpression() })
    return {
      property: {
        kind: 'spread',
        expression: identifierResult.element,
      },
      dependencies: identifierResult.dependencies,
      reservedNames: identifierResult.reservedNames,
    }
  }

  throw new Error(`Unsupported Node: ${node.getKindName()}`)
}
