import { Node } from 'ts-morph'
import { analyzeType } from '../type/analyzeType.js'
import { analyzeBindingName } from './analyzeBindingName.js'
import type { BindingElementAnalysis } from '@gyomu/schema/schemas/typescript'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../types.js'
import type { BindingElement, BindingName } from 'ts-morph'

/**
 * Analyzes a TypeScript binding element within a destructuring pattern, identifying its local name, default value, and any nested binding patterns.
 *
 * @param element The binding element node to analyze.
 *
 * @param index The index of the element within its parent pattern.
 *
 * @param args Contextual arguments for the analysis.
 *
 * @returns An object containing the analyzed member structure, collected dependencies, and reserved names for the scope.
 */
export const analyzeBindingElement = (
  element: BindingElement,
  index: number,
  args: ChildAnalysisArg<BindingName>,
): MemberAnalysisWithReservedResult<BindingElementAnalysis> => {
  const defaultValueNode = element.getInitializer()
  const defaultValueResult = defaultValueNode
    ? analyzeType(
        {
          ...args,
          node: defaultValueNode,
          memberPath: [...args.memberPath, index],
        },
        undefined,
      )
    : undefined

  const nameNode = element.getNameNode()
  const propName = element.getPropertyNameNode()?.getText()
  const isNested = !Node.isIdentifier(nameNode)
  const propertyName = propName ?? element.getName()
  const nestingPartternResult = isNested
    ? analyzeBindingName({
        ...args,
        node: nameNode,
        memberPath: [...args.memberPath, index],
      })
    : undefined

  return {
    member: {
      propertyName,
      localName: element.getPropertyNameNode()?.getText() ?? element.getName(),
      defaultValue: defaultValueResult?.member,
      nestedPattern: nestingPartternResult?.member,
    },
    dependencies: [
      ...(defaultValueResult?.dependencies ?? []),
      ...(nestingPartternResult?.dependencies ?? []),
    ],
    reservedNames: [propertyName, ...(nestingPartternResult?.reservedNames ?? [])],
  } satisfies MemberAnalysisWithReservedResult<BindingElementAnalysis>
}
