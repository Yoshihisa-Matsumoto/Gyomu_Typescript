import { withOptional } from '@gyomu/schema'
import { analyzeType } from '../analyzeType.js'
import type { PropertyMemberAnalysis } from '../../../symbol/MemberAnalysis.js'
import type { PropertySignature } from 'ts-morph'

export const analyzePropertyMember = (node: PropertySignature): PropertyMemberAnalysis => {
  const typeNode = node.getTypeNode()

  const initializer = node.getInitializer()
  // console.dir(typeNode)
  return {
    kind: 'property',

    name: node.getName(),

    ...withOptional({ type: analyzeType({ node: typeNode, initializer }) }),

    readonly: node.isReadonly(),

    optional: !!node.getQuestionTokenNode(),

    static: false,

    visibility: 'public',
  }
}
