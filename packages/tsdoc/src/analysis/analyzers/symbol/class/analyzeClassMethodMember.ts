import { analyzeFunctionMember } from '../struct/analyzeFunctionMember.js'
import { getAccessor } from './analyzeClassPropertyMember.js'
import type { ChildAnalysisArg } from '../../types.js'
import type { MethodDeclaration } from 'ts-morph'
import type {
  DocumentableMethodMemberAnalysis,
  NonDocumentableMethodMemberAnalysis,
} from '@gyomu/schema/typescript'

export const analyzeClassMethodMember = (
  args: ChildAnalysisArg<MethodDeclaration>,
  name: string,
  jsDocableNode: MethodDeclaration,
): DocumentableMethodMemberAnalysis | NonDocumentableMethodMemberAnalysis => {
  return analyzeFunctionMember(args, {
    isStatic: args.node.isStatic(),
    visibility: getAccessor(args.node),
    jsDocableNode,
    name,
  })
}
