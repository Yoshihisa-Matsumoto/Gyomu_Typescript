import { Node } from 'ts-morph'
import { initializeMethodIdentity, prepareMethodAnalysis } from '../../prepareMemberAnalysis.js'
import { analyzeType } from '../analyzeType.js'
import { computeIndent } from '../../computeIndent.js'
import { registerSymbolSymbolAnalysis } from '../../../../file/registerSymbolSymbolAnalysis.js'
import { analyzeTypePropertyMember } from '../analyzeTypePropertyMember.js'
import type { TypeLiteralNode } from 'ts-morph'
import type { ChildAnalysisArg, MemberAnalysisResult } from '../../../types.js'
import type { DocumentableTypeProperty, TypeProperty } from '@gyomu/schema/schemas/typescript/index'

export const analyzeTypeLiteralNode = (
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

  const newMemberPath = [...memberPath, '$member']
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
        const property: DocumentableTypeProperty = {
          documentable: true,
          id: methodIdentity.id,
          identity: methodIdentity.identity,
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
        registerSymbolSymbolAnalysis(metadata, property)
        return {
          member: property,
          dependencies: methodType.dependencies,
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
        registerSymbolSymbolAnalysis(metadata, property)

        return {
          member: property,
          dependencies: methodType.dependencies,
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
          const property: DocumentableTypeProperty = {
            documentable: true,
            id: methodIdentity.id,
            identity: methodIdentity.identity,
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
          registerSymbolSymbolAnalysis(metadata, property)
          return {
            member: property,
            dependencies: methodType.dependencies,
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
      console.log(`Unsupported Member on TypeLiteral ${member.getKindName()}`)
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
