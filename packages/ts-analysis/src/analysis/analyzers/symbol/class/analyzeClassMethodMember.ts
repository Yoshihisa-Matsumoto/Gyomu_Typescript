import { analyzeFunctionMember } from '../struct/analyzeFunctionMember.js'
import { getAccessor } from './analyzeClassPropertyMember.js'
import type { ChildAnalysisArg, MemberAnalysisResult } from '../../types.js'
import type { MethodDeclaration } from 'ts-morph'
import type {
  DocumentableMethodMemberAnalysis,
  NonDocumentableMethodMemberAnalysis,
} from '@gyomu/schema/schemas/typescript'

/**
 * Analyzes a class method member by extracting its metadata, including static status, visibility, and JSDoc documentation.
 *
 * @param args The context and node information for the analysis.
 *
 * @param name The name of the class method.
 *
 * @param jsDocableNode The JSDoc-compatible node to be analyzed.
 *
 * @returns The resulting analysis for the class method member, identifying if it is documentable or not.
 */
export const analyzeClassMethodMember = (
  args: ChildAnalysisArg<MethodDeclaration>,
  name: string,
  jsDocableNode: MethodDeclaration,
): MemberAnalysisResult<DocumentableMethodMemberAnalysis | NonDocumentableMethodMemberAnalysis> => {
  return analyzeFunctionMember(args, {
    isStatic: args.node.isStatic(),
    visibility: getAccessor(args.node),
    jsDocableNode,
    name,
  })
}
