import { withOptional } from '@gyomu/schema'
import { analyzeType } from '../analyzeType.js'
import { analyzeFunctionMemberInternal } from '../struct/analyzeFunctionMember.js'
import { createMemberIdentityAndId } from '../../../shared/createMemberIdentity.js'
import { getAccessor } from './analyzeClassPropertyMember.js'
import type { ChildAnalysisArg } from '../../types.js'
import type { ClassDeclaration, ConstructorDeclaration, ParameterDeclaration } from 'ts-morph'
import type {
  MemberAnalysis,
  NonDocumentablePropertyMemberAnalysis,
} from '@gyomu/schema/typescript'

export const analyzeConstructor = (
  args: ChildAnalysisArg<ConstructorDeclaration>,
  parent: ClassDeclaration,
): Array<MemberAnalysis> => {
  const name = '$constructor'
  const {
    sourceRelativePath,
    metadata,
    node,
    ownerSymbolId,
    ownerSymbolIdentity,
    sourceFullText,
    imported,
    options,
  } = args
  const method = analyzeFunctionMemberInternal(args, {
    name,
    isStatic: false,
    visibility: 'public',
    returnType: { text: parent.getName()!, source: 'typescript' },
    jsDocableNode: node,
  })
  // const method: DocumentableMethodMemberAnalysis = {
  //   kind: 'method',
  //   documentable: true,
  //   name,
  //   identity,

  //   parameters: node
  //     .getParameters()
  //     .map((p) => analyzeParameter(p, sourcePath, metadata, ownerSymbolId, memberPath)),
  //   snippet,

  //   // returnType: { text: parent.getName()! },

  //   ...withOptional({
  //     returnType: analyzeType({
  //       node: undefined,
  //       initializer: undefined,
  //       memberPath,
  //       metadata,
  //       nodeName: [name],
  //       ownerSymbolId,
  //       sourcePath,
  //       rawText: parent.getName()!,
  //     }),
  //     jsDoc,
  //   }),
  //   location,
  //   startOffset,
  //   static: false,
  //   visibility: 'public',
  // }

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
      }),
    )

  return [method, ...parameters]
}
const analyzeClassPropertyFromConstructorParameters = (
  args: ChildAnalysisArg<ParameterDeclaration>,
): NonDocumentablePropertyMemberAnalysis => {
  const { node, ownerSymbolId, ownerSymbolIdentity, memberPath, declarationOrder } = args
  const typeNode = node.getTypeNode()
  const initializer = node.getInitializer()
  const nodeName = node.getName()
  const { id, identity } = createMemberIdentityAndId(
    {
      memberPath,
      ownerSymbolId,
      signatureId: nodeName,
    },
    ownerSymbolIdentity,
  )
  return {
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

    ...withOptional({
      type: analyzeType(
        {
          ...args,
          node: typeNode ?? initializer,
        },
        [nodeName],
      ),
    }),
    static: false,
    visibility: getAccessor(node),
    declarationOrder,
  }
}
