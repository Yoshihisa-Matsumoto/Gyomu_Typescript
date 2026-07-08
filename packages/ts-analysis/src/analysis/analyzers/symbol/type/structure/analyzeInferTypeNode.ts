import { analyzeType } from '../analyzeType.js'
import type {
  MemberIdentityMemberPath,
  TypeAnalysis,
  TypeStructureAnalysis,
} from '@gyomu/schema/schemas/typescript'
import type { ChildAnalysisArg, MemberAnalysisResult } from '../../../types.js'
import type { InferTypeNode, TypeNode } from 'ts-morph'

export const analyzeInferTypeNode = (
  args: ChildAnalysisArg<TypeNode>,
  newMemberPath: MemberIdentityMemberPath,
  node: InferTypeNode,
): MemberAnalysisResult<TypeStructureAnalysis> => {
  const parameter = node.getTypeParameter()
  let constraintResult: MemberAnalysisResult<TypeAnalysis> | undefined = undefined
  const constraint = parameter.getConstraint()
  if (constraint) {
    constraintResult = analyzeType(
      {
        ...args,
        node: constraint,
        declarationOrder: 0,
        memberPath: [...newMemberPath, 'constraint'],
      },
      undefined,
    )
  }
  return {
    member: {
      kind: 'infer',
      parameter: parameter.getName(),
      constraint: constraintResult?.member,
    },
    dependencies: [...(constraintResult?.dependencies ?? [])],
  }
}
