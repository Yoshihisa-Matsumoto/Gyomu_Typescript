import { Node } from 'ts-morph'

import { analyzeDependency } from '../analyzeDependency.js'
import { getSupportedEffectSchemaType } from './getSupportedEffectSchemaType.js'
import { analyzeEffectSchemaPrimitive } from './analyzeEffectSchemaPrimitive.js'
import { analyzeEffectSchemaForNonPrimitive } from './analyzeEffectSchemaForNonPrimitive.js'
import type { MemberAnalysisResult } from '../../types.js'
import type {
  MemberIdentityMemberPath,
  SupportedSchemaKind,
  SymbolId,
} from '@gyomu/schema/typescript'
import type { CallExpression, Expression, Identifier, PropertyAccessExpression } from 'ts-morph'
import type {
  DependencyCandidate,
  ImportAnalysis,
  SchemaAnnotations,
  SymbolIdentity,
  TypeAnalysis,
} from '@gyomu/schema/schemas/typescript'

/**
 * Analyzes an Effect schema initializer by first verifying if it is supported and then performing a full schema analysis.
 *
 * @param initializer The expression to evaluate as an Effect schema.
 *
 * @param arg2 The context object containing metadata for the symbol being analyzed.
 *
 * @returns The analysis result of the Effect schema if supported; otherwise, undefined.
 */
export const checkAndAnalyzeEffectSchema = (
  initializer: Expression | undefined,
  arg2: {
    name: string
    ownerSymbolId: SymbolId
    ownerSymbolIdentity: SymbolIdentity
    imported: Array<ImportAnalysis>
    memberPath: MemberIdentityMemberPath
    dependencies: Array<DependencyCandidate>
  },
) => {
  const result = getSupportedEffectSchemaType(
    initializer,
    undefined,
    arg2.dependencies,
    arg2.imported,
    arg2.memberPath,
  )
  if (!result) return undefined
  return analyzeEffectSchema(result, arg2)
}

/**
 * Performs an analysis on a validated Effect schema to extract metadata and member definitions.
 *
 * @param arg1 The validated schema structure to analyze, including its kind, expression, and annotations.
 *
 * @param arg2 The analysis context object.
 *
 * @returns The member analysis result containing type structure and dependencies, or undefined if the input schema is invalid.
 */
export const analyzeEffectSchema = (
  arg1:
    | {
        kind: Exclude<SupportedSchemaKind, 'Reference'>
        expression: PropertyAccessExpression | CallExpression
        annotations: SchemaAnnotations | undefined
      }
    | {
        kind: Extract<SupportedSchemaKind, 'Reference'>
        expression: Identifier | CallExpression
        annotations: SchemaAnnotations | undefined
      }
    | undefined,
  arg2: {
    name: string
    ownerSymbolId: SymbolId
    ownerSymbolIdentity: SymbolIdentity
    imported: Array<ImportAnalysis>
    memberPath: MemberIdentityMemberPath
    dependencies: Array<DependencyCandidate>
  },
): MemberAnalysisResult<TypeAnalysis> | undefined => {
  if (!arg1) return undefined
  if (arg1.kind == 'Primitive')
    return analyzeEffectSchemaPrimitive(
      arg2.name,
      arg1.kind,
      arg1.expression,
      arg2.imported,
      arg2.memberPath,
      arg1.annotations,
    )
  const dependency = analyzeDependency(arg1.expression.getText(), arg2.imported, arg2.memberPath)
  if (arg1.kind == 'Reference') {
    const expression = arg1.expression
    if (Node.isCallExpression(expression)) {
      // const parametersResult = expression.getTypeArguments().map((argument, index) => {
      //         const newMemberPath = [...arg2.memberPath, '$generics', index]
      //         return analyzeType(
      //           {
      //             sourceRelativePath,
      //             metadata,
      //             ownerSymbolId,
      //             ownerSymbolIdentity,
      //             memberPath: newMemberPath,
      //             node: argument,
      //             sourceFullText,
      //             declarationOrder,
      //             arg2.imported,
      //             options,
      //             reservedNames,
      //           },
      //           undefined,
      //         )
      //       })
    }
    return {
      member: {
        source: 'effect-schema',
        text: arg2.name,
        structure: {
          kind: 'reference',
          targetId: arg1.expression.getText(),
          annotations: arg1.annotations,
          typeParameters: [],
        },
      },
      dependencies: [dependency],
    }
  }
  return analyzeEffectSchemaForNonPrimitive({
    name: arg2.name,
    supportType: arg1.kind,
    callExpression: arg1.expression as CallExpression,
    ownerSymbolId: arg2.ownerSymbolId,
    ownerSymbolIdentity: arg2.ownerSymbolIdentity,
    imported: arg2.imported,
    memberPath: arg2.memberPath,
    annotations: arg1.annotations,
    dependencies: arg2.dependencies,
  })
}
