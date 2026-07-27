import { Node } from 'ts-morph'

import { analyzeDependency } from '../analyzeDependency.js'
import type { MemberAnalysisResult } from '../../types.js'
import type { MemberIdentityMemberPath, SupportedSchemaKind } from '@gyomu/schema/typescript'
import type { CallExpression, PropertyAccessExpression } from 'ts-morph'
import type {
  ImportAnalysis,
  SchemaAnnotations,
  TypeAnalysis,
} from '@gyomu/schema/schemas/typescript'

/**
 * Analyzes an Effect schema primitive type definition and extracts its metadata and dependencies.
 *
 * @param name The name of the schema member.
 *
 * @param supportType The specific primitive schema kind.
 *
 * @param callExpression The AST node representing the schema primitive definition.
 *
 * @param imported The list of imported symbols.
 *
 * @param memberPath The path identifying the member in the module.
 *
 * @param annotations Optional schema annotations metadata.
 *
 * @returns Returns a member analysis result containing the primitive structure and dependencies, or undefined if the expression is invalid.
 */
export const analyzeEffectSchemaPrimitive = (
  name: string,
  supportType: Extract<SupportedSchemaKind, 'Primitive'>,
  callExpression: CallExpression | PropertyAccessExpression,
  imported: Array<ImportAnalysis>,
  memberPath: MemberIdentityMemberPath,
  annotations: SchemaAnnotations | undefined,
): MemberAnalysisResult<TypeAnalysis> | undefined => {
  let propertyExpression: PropertyAccessExpression | undefined = undefined
  if (Node.isPropertyAccessExpression(callExpression)) propertyExpression = callExpression
  if (Node.isCallExpression(callExpression)) {
    const expression = callExpression.getExpression()
    if (Node.isPropertyAccessExpression(expression)) propertyExpression = expression
  }
  if (!propertyExpression) return undefined

  const type = propertyExpression.getName().toLowerCase()
  const dependency = analyzeDependency(
    propertyExpression.getExpression().getText(),
    imported,
    memberPath,
  )
  return {
    member: {
      source: 'effect-schema',
      text: name,
      structure: {
        kind: 'primitive',
        elementType: type,
        annotations,
      },
    },
    dependencies: [dependency],
  }
}
