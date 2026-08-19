import { Node, SyntaxKind } from 'ts-morph'
import { detectEffectSignals } from '../analyzeEffectType.js'
import { tracePlaceIdentity } from '../../../trace/traceUtil.js'
import { analyzeTypeStructures } from './analyzeTypeStructure.js'
import { analyzeExpression } from './analyzeExpression.js'
import { analyzeTypeFunction } from './analyzeTypeFunction.js'
import { analyzeGenericsParameters } from './analyzeGenericsParameters.js'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../types.js'
import type { MemberIdentityMemberPath } from '@gyomu/schema/typescript'
import type { TypeAnalysis } from '@gyomu/schema/schemas/typescript'
import type { Expression, MethodSignature, TypeNode } from 'ts-morph'

/**
 * Generates a type analysis result representing the 'void' type.
 *
 * @returns A result object containing the member details for 'void'.
 */
export const getVoidTypeResult = (): MemberAnalysisWithReservedResult<TypeAnalysis> => ({
  member: { text: 'void', source: 'typescript' },
  dependencies: [],
  reservedNames: [],
})

/**
 * Generates a type analysis result representing the 'undefined' type.
 *
 * @returns A result object containing the member details for 'undefined'.
 */
export const getUndefinedTypeResult = (): MemberAnalysisWithReservedResult<TypeAnalysis> => ({
  member: { text: 'undefined', source: 'typescript' },
  dependencies: [],
  reservedNames: [],
})

/**
 * Analyzes a TypeScript node, expression, or method signature to produce a TypeAnalysis result.
 *
 * @param args The analysis context including the node to process and source information.
 *
 * @param nodeName Optional path segment names for the node.
 *
 * @param rawText Optional fallback text representation for the node.
 *
 * @returns A member analysis result containing dependencies, reserved names, and type structures.
 */
export const analyzeType = (
  args: ChildAnalysisArg<TypeNode | Expression | MethodSignature>,
  nodeName: Array<string> | undefined,

  rawText?: string | undefined,
): MemberAnalysisWithReservedResult<TypeAnalysis> => {
  const {
    node,
    sourceRelativePath,
    memberPath,
    metadata,
    ownerSymbolId,
    ownerSymbolIdentity,
    declarationOrder,
    imported,
    options,
    sourceFullText,
    registerSymbol,
  } = args
  tracePlaceIdentity(args, args.options, 'analyzeType')
  // if (node != undefined)
  {
    if (Node.isExpression(node)) {
      // console.log(`Expression: ${JSON.stringify(nodeName)} ${node.getKindName()}`)
      const newMemberPath: MemberIdentityMemberPath = [...memberPath, ...(nodeName ?? [])]
      return analyzeExpression({ ...args, node: node, memberPath: newMemberPath }, undefined)
    } else if (Node.isTypeNode(node)) {
      const newMemberPath = [...memberPath, ...(nodeName ?? [])]
      const genericsParametersResult = analyzeGenericsParameters({
        ...args,
        memberPath: newMemberPath,
      })
      // console.log(`TypeNode: ${JSON.stringify(nodeName)}`)
      // if (genericsParametersResult.dependencies.length > 0)
      //   console.dir(genericsParametersResult.dependencies, { depth: null })
      const nodeContent = node.getText()
      // console.log(`${nodeContent}`)
      // console.log(args.declarationOrder)
      // const genericsResult = analyzeGenericsParameters(args as ChildAnalysisArg<TypeNode>)

      const structureResult = analyzeTypeStructures(
        {
          sourceRelativePath,
          metadata,
          node,
          ownerSymbolId,
          ownerSymbolIdentity,
          memberPath: newMemberPath,

          sourceFullText,
          declarationOrder,
          imported,
          options,
          reservedNames: [],
          registerSymbol,
        },
        undefined,
      )
      return {
        member: {
          text: nodeContent,
          source: 'typescript',

          effect: detectEffectSignals(nodeContent),
          structure: structureResult.member,
          generics: genericsParametersResult.member,
        },
        dependencies: [...genericsParametersResult.dependencies, ...structureResult.dependencies],
        reservedNames: [...genericsParametersResult.reservedNames],
      }
    } else if (Node.isMethodSignature(node)) {
      // console.log(`MethodSignature: ${JSON.stringify(nodeName)}`)
      const genericsParametersResult = analyzeGenericsParameters(args)
      const newMemberPath: MemberIdentityMemberPath = [...memberPath, ...(nodeName ?? [])]
      // console.log(node.getKindName())
      const functionStructure = analyzeTypeFunction(
        { ...args, node, memberPath: newMemberPath },
        { name: node.getName(), jsDocableNode: node },
      )
      return {
        member: {
          text: node.getText(),
          source: 'typescript',

          effect: detectEffectSignals(node.getText()),
          structure: functionStructure.member,
          generics: genericsParametersResult.member,
        },
        dependencies: [...functionStructure.dependencies, ...genericsParametersResult.dependencies],
        reservedNames: [
          ...functionStructure.reservedNames,
          ...genericsParametersResult.reservedNames,
        ],
      }
    }
    const kind = (node as Node).getKind()
    switch (kind) {
      case SyntaxKind.VoidKeyword:
        return {
          member: {
            text: 'void',
            source: 'typescript',
          },
          dependencies: [],
          reservedNames: [],
        }
      case SyntaxKind.NeverKeyword:
        return {
          member: {
            text: 'never',
            source: 'typescript',
          },
          dependencies: [],
          reservedNames: [],
        }
      case SyntaxKind.UnknownKeyword:
        return {
          member: {
            text: 'unknown',
            source: 'typescript',
          },
          dependencies: [],
          reservedNames: [],
        }
    }
    // console.log(`${(node as Node).getKindName()}`)
    // console.dir(node, { depth: null })
  }
  console.log(`!!!!WHY???!!!!  ${rawText} `)
  console.log(`${(node as Node).getKindName()}`)
  console.trace()

  {
    return {
      member: {
        text: rawText ?? '',
        source: 'typescript',
      },
      dependencies: [],
      reservedNames: [],
    }
  }
}
