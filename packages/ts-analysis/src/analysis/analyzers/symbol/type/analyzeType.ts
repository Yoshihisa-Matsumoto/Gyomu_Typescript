import { Node, SyntaxKind } from 'ts-morph'
import { detectEffectSignals } from '../analyzeEffectType.js'
import { analyzeEffectSchema, getSupportedEffectSchemaType } from '../analyzeEffectSchema.js'
import { analyzeDependency, analyzeDependencyFromTypeReference } from '../analyzeDependency.js'
import { initializeMethodIdentity, prepareMethodAnalysis } from '../prepareMemberAnalysis.js'
import { analyzeTypeFunction } from './analyzeTypeFunction.js'
import { analyzeTypePropertyMember } from './analyzeTypePropertyMember.js'
import type { ChildAnalysisArg, MemberAnalysisResult } from '../../types.js'
import type {
  MemberIdentityMemberPath,
  TypeAnalysis,
  TypeProperty,
  TypeStructureAnalysis,
} from '@gyomu/schema/typescript'

import type { CallExpression, EntityName, Expression, TypeLiteralNode, TypeNode } from 'ts-morph'

export const analyzeType = (
  args: ChildAnalysisArg<TypeNode | Expression | undefined>,
  nodeName: Array<string> | undefined,
  rawText?: string | undefined,
): MemberAnalysisResult<TypeAnalysis> | undefined => {
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
    reservedNames,
  } = args

  if (node) {
    if (Node.isTypeNode(node)) {
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
          memberPath,

          sourceFullText,
          declarationOrder,
          imported,
          options,
          reservedNames,
        },
        nodeName,
      )
      return {
        member: {
          text: nodeContent,
          source: 'typescript',

          effect: detectEffectSignals(nodeContent),
          structure: structureResult?.member,
        },
        dependencies: structureResult?.dependencies ?? [],
      }
    } else {
      const newMemberPath: MemberIdentityMemberPath = [...memberPath, ...(nodeName ?? [])]
      if (Node.isCallExpression(node) || Node.isPropertyAccessExpression(node)) {
        const schemaEffectExpression = getSupportedEffectSchemaType(node)
        if (schemaEffectExpression != null) {
          // console.dir(schemaEffectExpression)
          // console.log(nodeName)
          return analyzeEffectSchema(schemaEffectExpression, {
            name: nodeName?.[0] ?? '',
            ownerSymbolId,
            ownerSymbolIdentity,
            imported,
            memberPath: newMemberPath,
          })
        }
      }

      const initialKind = node.getKind()
      switch (initialKind) {
        case SyntaxKind.TrueKeyword:
        case SyntaxKind.FalseKeyword:
          return {
            member: {
              text: 'boolean',
              source: 'typescript',
            },
            dependencies: [],
          }
        case SyntaxKind.StringKeyword:
          return {
            member: {
              text: 'string',
              source: 'typescript',
            },
            dependencies: [],
          }
        case SyntaxKind.BooleanKeyword:
          return {
            member: {
              text: 'boolean',
              source: 'typescript',
            },
            dependencies: [],
          }
        case SyntaxKind.NumberKeyword:
          return {
            member: {
              text: 'number',
              source: 'typescript',
            },
            dependencies: [],
          }
        case SyntaxKind.CallExpression: {
          const callExpression = node as CallExpression
          const expression = callExpression.getExpression()
          const dependency = analyzeDependency(expression.getText(), imported, newMemberPath)
          if (Node.isIdentifier(expression)) {
            return {
              member: {
                source: 'typescript',
                text: expression.getText(),
              },
              dependencies: [dependency],
            }
          }
          // console.log('CallExpression Not handled')
          // console.dir(node, { depth: null })
          break
        }
        default:
          // console.log(`Unhandled TypeNode kind: ${SyntaxKind[initialKind]}`)
          // console.dir(node, { depth: null })
          break
      }
      // if (Node.isObjectLiteralExpression(initializer)) {
      //   return {
      //     text: initializer.getText(),
      //     ...withOptional({
      //       effect: detectEffectSignals(initializer.getText()),
      //     }),
      //     structure: analyzeObjectLiteralTypeStructure({
      //       sourcePath,
      //       initializer,
      //       memberPath,
      //       metadata,
      //       ownerSymbolId,
      //       rawText: initializer.getText(),
      //     }),
      //   }
      // }
    }
  }
  if (rawText) {
    return {
      member: {
        text: rawText,
        source: 'typescript',
      },
      dependencies: [],
    }
  }
  return undefined
}

const analyzeTypeStructures = (
  args: ChildAnalysisArg<TypeNode>,
  nodeName: Array<string> | undefined,
): MemberAnalysisResult<TypeStructureAnalysis> | undefined => {
  const {
    sourceRelativePath,
    metadata,
    ownerSymbolId,
    ownerSymbolIdentity,
    sourceFullText,
    declarationOrder,
    imported,
    options,
    node,
    reservedNames,
  } = args
  const memberPath: MemberIdentityMemberPath = nodeName
    ? [...args.memberPath, ...nodeName]
    : args.memberPath
  if (Node.isTypeReference(node)) {
    const typeName = node.getTypeName()
    const typeArguments = node.getTypeArguments()

    const dependencies = analyzeDependencyFromTypeReference(
      node,
      imported,
      memberPath,
      reservedNames,
    )
    const typeAlias = analyzeType(
      {
        sourceRelativePath,
        metadata,
        ownerSymbolId,
        ownerSymbolIdentity,
        memberPath,
        node: typeArguments[0],
        sourceFullText,
        declarationOrder,
        imported,
        options,
        reservedNames,
      },
      undefined,
    )
    if (Node.isArrayTypeNode(node) && typeAlias) {
      // console.log('Array')
      // console.log(typeName.getText())
      return {
        member: {
          kind: 'array',
          elementType: typeAlias.member,
        },
        dependencies,
      }
    }
    if (typeName.getText().includes('Array')) {
      // console.log('Array')
      // console.log(typeName.getText())
      if (typeArguments.length == 1 && typeAlias) {
        return {
          member: {
            kind: 'array',
            elementType: typeAlias.member,
          },
          dependencies,
        }
      }
    } else {
      return {
        member: {
          kind: 'reference',
          targetId: computeTargetId(typeName),
        },
        dependencies,
      }
    }
  }
  if (Node.isUnionTypeNode(node) || Node.isIntersectionTypeNode(node)) {
    const memberTypeResult = node
      .getTypeNodes()
      .map((childType, index) =>
        analyzeType(
          {
            sourceRelativePath,
            metadata,
            node: childType,
            ownerSymbolId,
            ownerSymbolIdentity,
            memberPath: [...memberPath, index],
            sourceFullText,
            declarationOrder: index,
            imported,
            options,
            reservedNames,
          },
          undefined,
        ),
      )
      .filter((v) => !!v)
    return {
      member: {
        kind: 'union',
        types: memberTypeResult.map((t) => t.member),
      },
      dependencies: memberTypeResult.map((t) => t.dependencies).flat(),
    }
  }

  if (Node.isFunctionTypeNode(node)) {
    // const typeStructure = analyzeType({
    //   sourcePath,
    //   metadata,
    //   ownerSymbolId,
    //   memberPath,
    //   node: typeNode,
    //   nodeName,
    //   initializer: undefined,
    // })
    console.log(`FunctionTypeNode: ${nodeName}`)
    const method = analyzeTypeFunction(
      {
        sourceRelativePath,
        memberPath,
        metadata,
        node,
        ownerSymbolId,
        ownerSymbolIdentity,
        sourceFullText,
        declarationOrder,
        imported,
        options,
        reservedNames,
      },
      {
        isStatic: undefined,
        visibility: undefined,
        name: nodeName ? (nodeName[0] ?? '') : node.getText(),
        jsDocableNode: Node.isJSDocable(node) ? node : undefined,
      },
    )
    return {
      member: {
        kind: 'function',
        parameters: method.member.parameters,
        returnType: method.member.returnType,
      },
      dependencies: method.dependencies,
    }
  }
  if (Node.isMethodSignature(node)) {
    console.log(`MethodSignature: ${nodeName}`)
    const method = analyzeTypeFunction(
      {
        sourceRelativePath,
        metadata,
        node,
        ownerSymbolId,
        ownerSymbolIdentity,
        memberPath,

        sourceFullText,
        declarationOrder,
        imported,
        options,
        reservedNames,
      },
      {
        isStatic: undefined,
        visibility: undefined,
        name: nodeName ? (nodeName[0] ?? '') : node.getText(),
        jsDocableNode: Node.isJSDocable(node) ? node : undefined,
      },
    )
    return {
      member: {
        kind: 'function',
        parameters: method.member.parameters,
        returnType: method.member.returnType,
      },
      dependencies: method.dependencies,
    }
  }
  if (Node.isTypeLiteral(node)) {
    const membersResult = analyzeTypeLiteralMembers({
      sourceRelativePath,
      metadata,
      node,
      ownerSymbolId,
      ownerSymbolIdentity,
      memberPath,
      sourceFullText,
      declarationOrder,
      imported,
      options,
      reservedNames,
    })
    return {
      member: {
        kind: 'object',
        members: membersResult?.member,
      },
      dependencies: membersResult?.dependencies ?? [],
    }
  }
  console.log(`!!Unsupported Type!!`)
  console.dir(node, { depth: null })

  return undefined
}

const computeTargetId = (typeName: EntityName) => {
  return typeName.getText()
}
const analyzeTypeLiteralMembers = (
  args: ChildAnalysisArg<TypeLiteralNode>,
): MemberAnalysisResult<Array<TypeProperty>> | undefined => {
  const {
    node,
    sourceRelativePath,
    imported,
    memberPath,
    metadata,
    options,
    ownerSymbolId,
    ownerSymbolIdentity,
    sourceFullText,
    reservedNames,
  } = args

  const newMemberPath = [...args.memberPath, '$member']
  const members: Array<MemberAnalysisResult<TypeProperty>> = node
    .getMembers()
    .flatMap((member, index) => {
      if (Node.isMethodSignature(member)) {
        // const methodResult= analyzeTypeFunction(
        //   {
        //     sourceRelativePath,
        //     metadata,
        //     node: member,
        //     ownerSymbolId,
        //     ownerSymbolIdentity,
        //     memberPath,

        //     sourceFullText,
        //     declarationOrder: index,
        //     imported,
        //     options,
        //     reservedNames,
        //   },
        //   {
        //     isStatic: undefined,
        //     visibility: undefined,
        //     name: member.getName(),
        //     jsDocableNode: member,
        //   },
        // )
        const methodType = analyzeType(
          { ...args, memberPath: newMemberPath },
          [member.getName()],
          member.getFullText(),
        )
        const name = member.getName()
        const methodIdentity = initializeMethodIdentity(
          args.ownerSymbolId,
          args.ownerSymbolIdentity,
          newMemberPath,
          name,
          member,
        )
        const prepareResult = prepareMethodAnalysis(
          args.sourceRelativePath,
          args.metadata,
          args.ownerSymbolId,
          args.ownerSymbolIdentity,
          newMemberPath,
          name,
          member,
          member,
        )

        return {
          member: {
            documentable: true,
            id: methodIdentity.id,
            identity: methodIdentity.identity,
            name,
            optional: false,
            readonly: false,
            rest: false,
            type: methodType?.member,
            declarationOrder: index,
            jsDoc: prepareResult.jsDoc,
            parsedJsDoc: prepareResult.parsedJsDoc,
            location: prepareResult.location,
            startOffset: prepareResult.startOffset,
          },
          dependencies: methodType?.dependencies ?? [],
        } satisfies MemberAnalysisResult<TypeProperty>
      }
      if (Node.isFunctionTypeNode(member)) {
        // if (Node.isJSDocable(member)) {
        // return analyzeTypeFunction(
        //   {
        //     sourceRelativePath,
        //     metadata,
        //     node: member,
        //     ownerSymbolId,
        //     ownerSymbolIdentity,
        //     memberPath,

        //     sourceFullText,
        //     declarationOrder: index,
        //     imported,
        //     options,
        //     reservedNames,
        //   },
        //   {
        //     isStatic: undefined,
        //     visibility: undefined,
        //     name: Node.isNameable(member) ? member.getName()! : member.getText(),
        //     jsDocableNode: member,
        //   },
        // )
        const name = Node.isNameable(member) ? member.getName()! : member.getText()
        const methodType = analyzeType(
          { ...args, node: member, memberPath: newMemberPath },
          [name],
          member.getFullText(),
        )
        const prepareResult = prepareMethodAnalysis(
          args.sourceRelativePath,
          args.metadata,
          args.ownerSymbolId,
          args.ownerSymbolIdentity,
          newMemberPath,
          name,
          member,
          member,
        )

        const methodIdentity = initializeMethodIdentity(
          args.ownerSymbolId,
          args.ownerSymbolIdentity,
          newMemberPath,
          name,
          member,
        )

        return {
          member: {
            documentable: true,
            id: methodIdentity.id,
            identity: methodIdentity.identity,
            name,
            optional: false,
            readonly: false,
            rest: false,
            type: methodType?.member,
            declarationOrder: index,
            jsDoc: prepareResult.jsDoc,
            parsedJsDoc: prepareResult.parsedJsDoc,
            location: prepareResult.location,
            startOffset: prepareResult.startOffset,
          },
          dependencies: methodType?.dependencies ?? [],
        } satisfies MemberAnalysisResult<TypeProperty>
        // }
      }

      if (Node.isPropertySignature(member)) {
        console.log(member.getName())
        const memberTypeNode = member.getTypeNode()

        if (Node.isFunctionTypeNode(memberTypeNode)) {
          // const functionResult =  analyzeTypeFunction(
          //   {
          //     sourceRelativePath,
          //     metadata,
          //     node: memberTypeNode,
          //     ownerSymbolId,
          //     ownerSymbolIdentity,
          //     memberPath: newMemberPath,
          //     sourceFullText,
          //     declarationOrder: index,
          //     imported,
          //     options,
          //     reservedNames,
          //   },
          //   {
          //     isStatic: undefined,
          //     visibility: undefined,
          //     name: member.getName(),
          //     jsDocableNode: member,
          //   },
          // )
          const name = member.getName()
          const methodType = analyzeType(
            { ...args, node: memberTypeNode, memberPath: newMemberPath },
            [name],
            member.getFullText(),
          )
          const prepareResult = prepareMethodAnalysis(
            args.sourceRelativePath,
            args.metadata,
            args.ownerSymbolId,
            args.ownerSymbolIdentity,
            newMemberPath,
            name,
            memberTypeNode,
            member,
          )

          const methodIdentity = initializeMethodIdentity(
            args.ownerSymbolId,
            args.ownerSymbolIdentity,
            newMemberPath,
            name,
            memberTypeNode,
          )

          return {
            member: {
              documentable: true,
              id: methodIdentity.id,
              identity: methodIdentity.identity,
              name,
              optional: false,
              readonly: false,
              rest: false,
              type: methodType?.member,
              declarationOrder: index,
              jsDoc: prepareResult.jsDoc,
              parsedJsDoc: prepareResult.parsedJsDoc,
              location: prepareResult.location,
              startOffset: prepareResult.startOffset,
            },
            dependencies: methodType?.dependencies ?? [],
          } satisfies MemberAnalysisResult<TypeProperty>
        }
        return analyzeTypePropertyMember({
          sourceRelativePath,
          metadata,
          node: member,
          ownerSymbolId,
          ownerSymbolIdentity,
          memberPath: newMemberPath,
          sourceFullText,
          declarationOrder: index,
          imported,
          options,
          reservedNames,
        })
      }

      return undefined
    })
    .filter((m) => !!m)
  if (members.length > 0)
    return {
      member: members.map((m) => m.member),
      dependencies: members.map((m) => m.dependencies).flat(),
    }
  return undefined
}
