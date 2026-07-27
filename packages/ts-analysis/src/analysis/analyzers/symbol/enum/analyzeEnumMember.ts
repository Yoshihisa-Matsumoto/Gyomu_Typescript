import { computeIndent } from '../computeIndent.js'
import { analyzeType } from '../type/analyzeType.js'
import { preparePropertyAnalysis } from '../prepareMemberAnalysis.js'
import { registerSymbolSymbolAnalysis } from '../../../file/registerSymbolSymbolAnalysis.js'
import type {
  DocumentablePropertyMemberAnalysis,
  TypeAnalysis,
} from '@gyomu/schema/schemas/typescript'
import type { ChildAnalysisArg, MemberAnalysisResult } from '../../types.js'
import type { EnumMember } from 'ts-morph'

export const analyzeEnumMember = (
  args: ChildAnalysisArg<EnumMember>,
  args2: {
    previousNumber: number | undefined
  },
): MemberAnalysisResult<DocumentablePropertyMemberAnalysis> => {
  const {
    node,
    declarationOrder,
    imported,
    memberPath,
    metadata,
    ownerSymbolId,
    ownerSymbolIdentity,
    sourceFullText,
    sourceRelativePath,
    options,
    reservedNames,
  } = args

  const name = node.getName()
  const initializer = node.getInitializer()

  const { id, identity, jsDoc, location, startOffset, parsedJsDoc } = preparePropertyAnalysis(
    sourceRelativePath,
    metadata,
    ownerSymbolId,
    ownerSymbolIdentity,
    memberPath,
    name,
    node,
    node,
    options,
  )

  let typeResult: MemberAnalysisResult<TypeAnalysis> | undefined
  if (!initializer) {
    // 前の値があれば、その値のincrement
    if (args2.previousNumber != undefined) {
      typeResult = {
        member: {
          source: 'typescript',
          text: '',
          structure: { kind: 'literal', elementValue: args2.previousNumber + 1 },
        },
        dependencies: [],
      }
    } else {
      typeResult = {
        member: {
          source: 'typescript',
          text: '',
          structure: { kind: 'literal', elementValue: 0 },
        },
        dependencies: [],
      }
    }
  } else {
    typeResult = analyzeType(
      {
        node: initializer,
        memberPath,
        metadata,
        ownerSymbolId,
        ownerSymbolIdentity,
        sourceRelativePath,
        sourceFullText: args.sourceFullText,
        declarationOrder: args.declarationOrder,
        imported,
        options,
        reservedNames,
      },
      [name],
    )
  }
  const property = {
    documentable: true,
    source: 'enum-parameter',
    id,
    identity,
    ownerSymbolId,
    name,
    kind: 'property',
    readonly: false,
    optional: false,

    type: typeResult.member,
    binding: undefined,
    jsDoc,
    parsedJsDoc,

    location,
    startOffset,
    rest: false,

    static: false,
    visibility: 'public',
    declarationOrder,
    docIndent: computeIndent(sourceFullText, node.getStart(), node.getStartLinePos()),
  } satisfies DocumentablePropertyMemberAnalysis
  registerSymbolSymbolAnalysis(metadata, property, options)
  return {
    member: property,
    dependencies: [...typeResult.dependencies],
  }
}
