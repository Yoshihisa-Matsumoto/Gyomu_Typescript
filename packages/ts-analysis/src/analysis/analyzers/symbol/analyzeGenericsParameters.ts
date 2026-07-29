import { Node } from 'ts-morph'
import { analyzeDependencyFromTypeParameters } from './analyzeDependency.js'
import type { TypeParameteredNode } from 'ts-morph'
import type { ChildAnalysisArg, GenericParameterAnalysisResult } from '../types.js'

/**
 * Analyzes generics parameters and associated dependencies for a given TypeScript AST node.
 *
 * @param args The child analysis argument object containing the node to analyze, import context, and member path.
 *
 * @returns An analysis result containing the extracted parameter names, identified dependencies, and the node name if available.
 */
export const analyzeGenericsParameters = (
  args: ChildAnalysisArg<TypeParameteredNode & Node>,
): GenericParameterAnalysisResult => {
  const { node, imported, memberPath } = args
  const typeParameters = node.getTypeParameters()
  const parameters = typeParameters.map((param) => param.getName())
  const newReservedNames = [...args.reservedNames, ...parameters]

  const name = Node.isTypeReference(node) ? node.getTypeName().getText() : undefined
  // console.log(`generics member: ${memberPath.join('.')}`)
  const dependencies = analyzeDependencyFromTypeParameters(
    typeParameters,
    imported,
    memberPath,
    newReservedNames,
    args.options,
  )
  return { parameters, dependencies, name }
}
