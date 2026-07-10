import { Node } from 'ts-morph'

import { analyzeDependency } from '../analyzeDependency.js'
import type { SchemaAnnotations } from '@gyomu/schema/schemas/typescript/type/SchemaAnnotations'
import type { MemberAnalysisResult } from '../../types.js'
import type { MemberIdentityMemberPath, SupportedSchemaKind } from '@gyomu/schema/typescript'
import type { CallExpression, PropertyAccessExpression } from 'ts-morph'
import type { ImportAnalysis, TypeAnalysis } from '@gyomu/schema/schemas/typescript'

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
