import { Node } from 'ts-morph'
import { analyzeType } from './analyzeType.js'
import type { GenericsProperty } from '@gyomu/schema/schemas/typescript'
import type {
  ChildAnalysisArg,
  MemberAnalysisResult,
  MemberAnalysisWithReservedResult,
} from '../../types.js'
import type { Expression, MethodSignature, TypeNode } from 'ts-morph'

/**
 * Analyzes the generic type parameters of a node and returns their properties, constraints, and dependencies.
 *
 * @param args The analysis arguments containing the node to inspect.
 *
 * @returns An analysis result containing the list of generic properties, aggregated dependencies, and reserved parameter names.
 */
export const analyzeGenericsParameters = (
  args: ChildAnalysisArg<TypeNode | Expression | MethodSignature>,
): MemberAnalysisWithReservedResult<Array<GenericsProperty>> => {
  const { node, memberPath } = args

  if (Node.isTypeParametered(node)) {
    const newMemberPath = [...memberPath, '$generics']
    const genericsPropertiesResult: Array<MemberAnalysisResult<GenericsProperty>> = node
      .getTypeParameters()
      .map((tp, index) => {
        const parameterName = tp.getName()
        const constraint = tp.getConstraint()
        if (constraint) {
          const constraintTypeResult = analyzeType(
            { ...args, node: constraint, memberPath: [...newMemberPath, parameterName] },
            undefined,
          )
          return {
            member: {
              name: parameterName,
              type: constraintTypeResult.member,
            },
            dependencies: [...constraintTypeResult.dependencies],
          } satisfies MemberAnalysisResult<GenericsProperty>
        } else {
          return {
            member: {
              name: parameterName,
              type: undefined,
            },
            dependencies: [],
          } satisfies MemberAnalysisResult<GenericsProperty>
        }
      })
    return {
      member: genericsPropertiesResult.map((gp) => gp.member),
      dependencies: genericsPropertiesResult.map((gp) => gp.dependencies).flat(),
      reservedNames: genericsPropertiesResult.map((gp) => gp.member.name),
    }
  }

  return {
    member: [],
    dependencies: [],
    reservedNames: [],
  }
}
