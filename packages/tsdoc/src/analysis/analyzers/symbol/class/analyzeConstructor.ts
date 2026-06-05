import { withOptional } from '@gyomu/schema'
import { analyzeParameter } from '../analyzeParameter.js'
import { analyzeType } from '../analyzeType.js'
import { getAccessor } from './analyzePropertyMember.js'
import type {
  MemberAnalysis,
  MethodMemberAnalysis,
  PropertyMemberAnalysis,
} from '../../../symbol/MemberAnalysis.js'
import type { ClassDeclaration, ConstructorDeclaration, ParameterDeclaration } from 'ts-morph'

export const analyzeConstructor = (
  node: ConstructorDeclaration,
  parent: ClassDeclaration,
): Array<MemberAnalysis> => {
  const method: MethodMemberAnalysis = {
    kind: 'method',
    name: 'constructor',
    visibility: 'public',
    parameters: node.getParameters().map(analyzeParameter),
    static: false,
    returnType: { text: parent.getName()! },
  }

  const parameters = node
    .getParameters()
    .filter((p) => p.getModifiers().length > 0)
    .map(analyzeClassPropertyFromConstructorParameters)

  return [method, ...parameters]
}
const analyzeClassPropertyFromConstructorParameters = (
  node: ParameterDeclaration,
): PropertyMemberAnalysis => {
  const typeNode = node.getTypeNode()
  const initializer = node.getInitializer()
  return {
    kind: 'property',
    name: node.getName(),
    readonly: node.isReadonly(),
    optional: !!node.getQuestionTokenNode(),
    static: false,
    visibility: getAccessor(node),
    ...withOptional({ type: analyzeType({ node: typeNode, initializer }) }),
  }
}
