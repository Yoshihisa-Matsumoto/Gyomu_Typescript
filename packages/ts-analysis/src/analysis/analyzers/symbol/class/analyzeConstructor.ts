import { SignatureId } from '@gyomu/schema/typescript'
import { analyzeType } from '../type/analyzeType.js'
import { analyzeFunctionMemberInternal } from '../struct/analyzeFunctionMember.js'
import { createMemberIdentityAndId } from '../../../shared/createMemberIdentity.js'
import { analyzeBindingName } from '../binding/analyzeBindingName.js'
import { getAccessor } from './analyzeClassPropertyMember.js'
import type {
  MemberAnalysis,
  NonDocumentablePropertyMemberAnalysis,
} from '@gyomu/schema/schemas/typescript'
import type {
  ChildAnalysisArg,
  MemberAnalysisResult,
  MemberAnalysisWithReservedResult,
} from '../../types.js'
import type { ClassDeclaration, ConstructorDeclaration, ParameterDeclaration } from 'ts-morph'

/**
 * Analyzes a constructor declaration within a class to extract its function signature and any class properties defined as constructor parameters.
 *
 * @param args The child analysis arguments containing the constructor node and context.
 *
 * @param parent The parent class declaration containing the constructor.
 *
 * @param name The name of the constructor member.
 *
 * @returns A result object containing the analyzed class members and their dependencies.
 */
export const analyzeConstructor = (
  args: ChildAnalysisArg<ConstructorDeclaration>,
  parent: ClassDeclaration,
  name: string,
): MemberAnalysisResult<Array<MemberAnalysis>> => {
  const {
    sourceRelativePath,
    metadata,
    node,
    ownerSymbolId,
    ownerSymbolIdentity,
    sourceFullText,
    imported,
    options,
    reservedNames,
    registerSymbol,
  } = args
  const method = analyzeFunctionMemberInternal(args, {
    name,
    isStatic: false,
    visibility: 'public',
    returnType: { member: { text: parent.getName()!, source: 'typescript' }, dependencies: [] },
    jsDocableNode: node,
  })

  const parameters = node
    .getParameters()
    .filter((p) => p.getModifiers().length > 0)
    .map((v, index) =>
      analyzeClassPropertyFromConstructorParameters({
        sourceRelativePath,
        metadata,
        node: v,
        ownerSymbolId,
        ownerSymbolIdentity,
        memberPath: [],
        sourceFullText,
        declarationOrder: index,
        imported,
        options,
        reservedNames,
        registerSymbol,
      }),
    )
  // BODY
  return {
    member: [method.member, ...parameters.map((p) => p.member)],
    dependencies: [...method.dependencies, ...parameters.map((p) => p.dependencies).flat()],
  }
}
const analyzeClassPropertyFromConstructorParameters = (
  args: ChildAnalysisArg<ParameterDeclaration>,
): MemberAnalysisWithReservedResult<NonDocumentablePropertyMemberAnalysis> => {
  const { node, ownerSymbolId, ownerSymbolIdentity, memberPath, declarationOrder } = args
  const typeNode = node.getTypeNode()
  const initializer = node.getInitializer()
  const nodeName = node.getName()
  const { id, identity } = createMemberIdentityAndId(
    {
      memberPath,
      ownerSymbolId,
      signatureId: SignatureId(nodeName),
    },
    ownerSymbolIdentity,
  )
  // analyzeFunctionBody({...args, node:node})
  const typeResult =
    typeNode || initializer
      ? analyzeType(
          {
            ...args,
            node: typeNode ?? initializer!,
          },
          [nodeName],
        )
      : undefined

  const bindingResult =
    typeResult == undefined
      ? analyzeBindingName({
          ...args,
          node: node.getNameNode(),
          memberPath: [...memberPath, nodeName],
        })
      : undefined

  return {
    member: {
      kind: 'property',
      documentable: false,
      source: 'constructor-parameter',
      id,
      ownerSymbolId,
      identity,
      rest: !!node.getDotDotDotToken(),
      name: nodeName,
      readonly: node.isReadonly(),
      optional: !!node.getQuestionTokenNode(),

      type: typeResult?.member,
      binding: bindingResult?.member,
      static: false,
      visibility: getAccessor(node),
      declarationOrder,
    },
    dependencies: [...(typeResult?.dependencies ?? []), ...(bindingResult?.dependencies ?? [])],
    reservedNames: [...(typeResult?.reservedNames ?? []), ...(bindingResult?.reservedNames ?? [])],
  }
}
