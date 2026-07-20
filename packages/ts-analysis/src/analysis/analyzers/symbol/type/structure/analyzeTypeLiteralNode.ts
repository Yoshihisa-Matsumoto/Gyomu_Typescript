import { Node } from 'ts-morph'
import { initializeMethodIdentity, prepareMethodAnalysis } from '../../prepareMemberAnalysis.js'
import { analyzeType } from '../analyzeType.js'
import { computeIndent } from '../../computeIndent.js'
import { registerSymbolSymbolAnalysis } from '../../../../file/registerSymbolSymbolAnalysis.js'
import { analyzeTypePropertyMember } from '../analyzeTypePropertyMember.js'
import { tracePlaceIdentity } from '../../../../trace/traceUtil.js'
import { analyzeIndexSignature } from '../analyzeIndexSignature.js'
import type { TypeLiteralNode } from 'ts-morph'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../../types.js'
import type {
  DocumentableTypeProperty,
  IndexSignatureAnalysis,
  TypeProperty,
  TypeStructureAnalysis,
} from '@gyomu/schema/schemas/typescript'

export const analyzeTypeLiteralNode = (
  args: ChildAnalysisArg<TypeLiteralNode>,
): MemberAnalysisWithReservedResult<TypeStructureAnalysis> => {
  tracePlaceIdentity(args, args.options, 'analyzeTypeLiteralNode')
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

  const newMemberPath = [...memberPath, '$member']
  const properties: Array<MemberAnalysisWithReservedResult<TypeProperty>> = node
    .getMembers()
    .flatMap((member, index) => {
      // console.dir(member.getKindName())
      if (Node.isMethodSignature(member)) {
        tracePlaceIdentity(args, args.options, 'analyzeTypeLiteralNode:MethodSignature')
        const methodType = analyzeType(
          { ...args, node: member, memberPath: newMemberPath },
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
          options,
        )
        const property: DocumentableTypeProperty = {
          documentable: true,
          id: methodIdentity.id,
          identity: methodIdentity.identity,
          kind: 'type-property',
          name,
          optional: false,
          readonly: false,
          rest: false,
          type: methodType.member,
          declarationOrder: index,
          jsDoc: prepareResult.jsDoc,
          parsedJsDoc: prepareResult.parsedJsDoc,
          location: prepareResult.location,
          startOffset: prepareResult.startOffset,
          docIndent: computeIndent(
            args.sourceFullText,
            member.getStart(),
            member.getStartLinePos(),
          ), // TODO : Not sure about it
        }
        registerSymbolSymbolAnalysis(metadata, property, options)
        return {
          member: property,
          dependencies: methodType.dependencies,
          reservedNames: methodType.reservedNames,
        } satisfies MemberAnalysisWithReservedResult<TypeProperty>
      }
      if (Node.isFunctionTypeNode(member)) {
        const name = Node.isNameable(member) ? member.getName()! : member.getText()
        const methodType = analyzeType({ ...args, node: member, memberPath: newMemberPath }, [name])
        const prepareResult = prepareMethodAnalysis(
          args.sourceRelativePath,
          args.metadata,
          args.ownerSymbolId,
          args.ownerSymbolIdentity,
          newMemberPath,
          name,
          member,
          member,
          options,
        )

        const methodIdentity = initializeMethodIdentity(
          args.ownerSymbolId,
          args.ownerSymbolIdentity,
          newMemberPath,
          name,
          member,
        )

        const property: DocumentableTypeProperty = {
          documentable: true,
          id: methodIdentity.id,
          identity: methodIdentity.identity,
          kind: 'type-property',
          name,
          optional: false,
          readonly: false,
          rest: false,
          type: methodType.member,
          declarationOrder: index,
          jsDoc: prepareResult.jsDoc,
          parsedJsDoc: prepareResult.parsedJsDoc,
          location: prepareResult.location,
          startOffset: prepareResult.startOffset,
          docIndent: computeIndent(
            args.sourceFullText,
            member.getStart(),
            member.getStartLinePos(),
          ), // TODO : Not sure about it
        }
        registerSymbolSymbolAnalysis(metadata, property, options)

        return {
          member: property,
          dependencies: methodType.dependencies,
          reservedNames: methodType.reservedNames,
        } satisfies MemberAnalysisWithReservedResult<TypeProperty>
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
          )
          console.dir(methodType.dependencies, { depth: null })
          const prepareResult = prepareMethodAnalysis(
            args.sourceRelativePath,
            args.metadata,
            args.ownerSymbolId,
            args.ownerSymbolIdentity,
            newMemberPath,
            name,
            memberTypeNode,
            member,
            options,
          )

          const methodIdentity = initializeMethodIdentity(
            args.ownerSymbolId,
            args.ownerSymbolIdentity,
            newMemberPath,
            name,
            memberTypeNode,
          )
          const property: DocumentableTypeProperty = {
            documentable: true,
            id: methodIdentity.id,
            identity: methodIdentity.identity,
            kind: 'type-property',
            name,
            optional: false,
            readonly: false,
            rest: false,
            type: methodType.member,
            declarationOrder: index,
            jsDoc: prepareResult.jsDoc,
            parsedJsDoc: prepareResult.parsedJsDoc,
            location: prepareResult.location,
            startOffset: prepareResult.startOffset,
            docIndent: computeIndent(
              args.sourceFullText,
              memberTypeNode.getStart(),
              memberTypeNode.getStartLinePos(),
            ), // TODO : Not sure about it
          }
          registerSymbolSymbolAnalysis(metadata, property, options)
          return {
            member: property,
            dependencies: methodType.dependencies,
            reservedNames: methodType.reservedNames,
          } satisfies MemberAnalysisWithReservedResult<TypeProperty>
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
      if (Node.isIndexSignatureDeclaration(member)) {
        return undefined
      }
      console.log(`Unsupported Member on TypeLiteral ${member.getKindName()}`)
      return undefined
    })
    .filter((m) => !!m)
  const indexSignatures: Array<MemberAnalysisWithReservedResult<IndexSignatureAnalysis>> = node
    .getMembers()
    .flatMap((member, index) => {
      // console.dir(member.getKindName())
      if (Node.isMethodSignature(member)) {
        return undefined
      }
      if (Node.isFunctionTypeNode(member)) {
        return undefined
      }

      if (Node.isPropertySignature(member)) {
        return undefined
      }
      if (Node.isIndexSignatureDeclaration(member)) {
        const indexSignature = member
        return analyzeIndexSignature({
          ...args,
          node: indexSignature,
          memberPath: newMemberPath,
          declarationOrder: index,
        })
      }
      console.log(`Unsupported Member on TypeLiteral ${member.getKindName()}`)
      return undefined
    })
    .filter((m) => !!m)
  // if (members.length > 0)
  return {
    member: {
      kind: 'object',
      properties: properties.map((m) => m.member),
      indexSignatures: indexSignatures.map((m) => m.member),
    },

    dependencies: [
      ...properties.map((m) => m.dependencies).flat(),
      ...indexSignatures.map((m) => m.dependencies).flat(),
    ],
    reservedNames: [
      ...properties.map((m) => m.reservedNames).flat(),
      ...indexSignatures.map((m) => m.reservedNames).flat(),
    ],
  }
  // return undefined
}
