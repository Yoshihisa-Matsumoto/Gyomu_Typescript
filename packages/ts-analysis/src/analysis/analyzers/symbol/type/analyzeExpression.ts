import { Node, SyntaxKind } from 'ts-morph'
import { analyzeEffectSchema, getSupportedEffectSchemaType } from '../analyzeEffectSchema.js'
import { analyzeDependency } from '../analyzeDependency.js'
import { analyzeGenericsParameters } from './analyzeGenericsParameters.js'
import { analyzeTypeFunction } from './analyzeTypeFunction.js'
import type { ArrowFunction, CallExpression, Expression } from 'ts-morph'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../types.js'
import type { TypeAnalysis } from '@gyomu/schema/schemas/typescript'

export const analyzeExpression = (
  args: ChildAnalysisArg<Expression>,
  nodeName: Array<string> | undefined,
): MemberAnalysisWithReservedResult<TypeAnalysis> => {
  const { node, memberPath, ownerSymbolId, ownerSymbolIdentity, imported } = args
  const genericsParametersResult = analyzeGenericsParameters(args)
  if (
    Node.isCallExpression(node) ||
    Node.isPropertyAccessExpression(node) ||
    Node.isArrowFunction(node)
  ) {
    const schemaEffectExpression = getSupportedEffectSchemaType(
      node,
      undefined,
      [],
      args.imported,
      memberPath,
    )
    if (schemaEffectExpression != null) {
      // console.dir(schemaEffectExpression)
      // console.log(nodeName)
      const effectSchema = analyzeEffectSchema(schemaEffectExpression, {
        name: nodeName?.[0] ?? '',
        ownerSymbolId,
        ownerSymbolIdentity,
        imported,
        memberPath,
        dependencies: schemaEffectExpression.dependencies,
      })
      if (effectSchema) return { ...effectSchema, reservedNames: [] }
    }
  }

  const initialKind = node.getKind()
  switch (initialKind) {
    case SyntaxKind.TrueKeyword:
      return {
        member: {
          text: 'string',
          structure: {
            kind: 'literal',
            elementValue: true,
          },
          source: 'typescript',
        },
        dependencies: [],
        reservedNames: [],
      }
    case SyntaxKind.FalseKeyword:
      return {
        member: {
          text: 'string',
          structure: {
            kind: 'literal',
            elementValue: false,
          },
          source: 'typescript',
        },
        dependencies: [],
        reservedNames: [],
      }
    case SyntaxKind.StringKeyword:
      return {
        member: {
          text: 'string',
          source: 'typescript',
        },
        dependencies: [],
        reservedNames: [],
      }
    case SyntaxKind.BooleanKeyword:
      return {
        member: {
          text: 'boolean',
          source: 'typescript',
        },
        dependencies: [],
        reservedNames: [],
      }
    case SyntaxKind.NumberKeyword:
      return {
        member: {
          text: 'number',
          source: 'typescript',
        },
        dependencies: [],
        reservedNames: [],
      }
    case SyntaxKind.VoidKeyword:
      return {
        member: {
          text: 'void',
          source: 'typescript',
        },
        dependencies: [],
        reservedNames: [],
      }
    case SyntaxKind.NumericLiteral:
      return {
        member: {
          text: 'number',
          structure: {
            kind: 'literal',
            elementValue: Number(node.getText()),
          },
          source: 'typescript',
        },
        dependencies: [],
        reservedNames: [],
      }
    case SyntaxKind.StringLiteral:
      return {
        member: {
          text: 'string',
          structure: {
            kind: 'literal',
            elementValue: node.getText(),
          },
          source: 'typescript',
        },
        dependencies: [],
        reservedNames: [],
      }
    case SyntaxKind.ArrowFunction: {
      const functionResult = analyzeTypeFunction(
        { ...args, node: node as ArrowFunction },
        { name: '', jsDocableNode: node as ArrowFunction },
      )
      const genericsParametersResult = analyzeGenericsParameters({
        ...args,
        memberPath,
      })
      return {
        member: {
          source: 'typescript',
          text: '',
          structure: functionResult.member,
          generics: genericsParametersResult.member,
        },
        dependencies: [...functionResult.dependencies, ...genericsParametersResult.dependencies],
        reservedNames: [...functionResult.reservedNames, ...genericsParametersResult.reservedNames],
      }
    }
    case SyntaxKind.CallExpression: {
      const callExpression = node as CallExpression
      const expression = callExpression.getExpression()
      const dependency = analyzeDependency(expression.getText(), imported, memberPath)
      if (Node.isIdentifier(expression)) {
        return {
          member: {
            source: 'typescript',
            text: expression.getText(),
            generics: genericsParametersResult.member,
          },
          dependencies: [dependency, ...genericsParametersResult.dependencies],
          reservedNames: [...genericsParametersResult.reservedNames],
        }
      }
      // console.log('CallExpression Not handled')
      // console.dir(node, { depth: null })
      break
    }
    default:
      return {
        member: {
          source: 'typescript',
          text: node.getText(),
        },
        dependencies: [],
        reservedNames: [],
      }
  }
  return {
    member: {
      source: 'typescript',
      text: node.getText(),
    },
    dependencies: [],
    reservedNames: [],
  }
}
