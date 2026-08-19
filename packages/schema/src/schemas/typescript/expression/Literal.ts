import { Schema } from 'effect'
import { NonDocumentableMethodMemberAnalysis } from '../member/NonDocumentableMethodMemberAnalysis.js'
import { DocumentableMethodMemberAnalysis } from '../member/DocumentableMethodMemberAnalysis.js'
import { ExpressionAnalysis } from './ExpressionAnalysis.js'

/**
 * Defines a null keyword schema.
 */
export const NullKeyword = Schema.Struct({ kind: Schema.Literal('null') }).pipe(
  Schema.annotate({ description: 'null keyword' }),
)

/**
 * Represents the type of the NullKeyword schema.
 */
export type NullKeyword = Schema.Schema.Type<typeof NullKeyword>

/**
 * Represents an expression analysis for a string literal reference containing a kind and value.
 */
export interface StringLiteralExpressionAnalysis {
  /**
   * The literal discriminator value.
   */
  readonly kind: 'string-literal'

  /**
   * The string literal value.
   */
  readonly value: string
}

/**
 * Defines an expression analysis schema representing a string literal reference.
 */
export const StringLiteralExpressionAnalysis: Schema.Schema<StringLiteralExpressionAnalysis> =
  Schema.Struct({
    kind: Schema.Literal('string-literal'),
    value: Schema.String,
  }).pipe(
    Schema.annotate({
      description: 'An expression analysis representing an string literal reference.',
    }),
  )

/**
 * Represents an expression analysis for a numeric literal reference containing a kind and value.
 */
export interface NumericLiteralExpressionAnalysis {
  /**
   * The literal discriminator value.
   */
  readonly kind: 'numeric-literal'

  /**
   * The numeric literal value.
   */
  readonly value: number
}

/**
 * Defines an expression analysis schema representing a numeric literal reference.
 */
export const NumericLiteralExpressionAnalysis: Schema.Schema<NumericLiteralExpressionAnalysis> =
  Schema.Struct({
    kind: Schema.Literal('numeric-literal'),
    value: Schema.Number,
  }).pipe(
    Schema.annotate({
      description: 'An expression analysis representing an numeric literal reference.',
    }),
  )

/**
 * Represents an expression analysis for an array literal reference containing a kind and an array of expression analyses.
 */
export interface ArrayLiteralExpressionAnalysis {
  /**
   * The literal discriminator value.
   */
  readonly kind: 'array-literal'

  /**
   * The array elements of the expression analysis.
   */
  readonly value: ReadonlyArray<ExpressionAnalysis>
}

/**
 * Defines an expression analysis schema representing an array literal reference.
 */
export const ArrayLiteralExpressionAnalysis: Schema.Schema<ArrayLiteralExpressionAnalysis> =
  Schema.Struct({
    kind: Schema.Literal('array-literal'),
    value: Schema.Array(Schema.suspend(() => ExpressionAnalysis)),
  }).pipe(
    Schema.annotate({
      description: 'An expression analysis representing an array literal reference.',
    }),
  )

/**
 * Represents an analysis union for object literal properties, either assignment or spread.
 */
export type ObjectLiteralPropertyAnalysis =
  | ObjectLiteralPropertyAssignmentAnalysis
  | ObjectLiteralSpreadAssignmentAnalysis
  | ObjectLiteralMethodAnalysis

/**
 * Represents an object literal property assignment analysis containing a kind, name, and expression value.
 */
export interface ObjectLiteralPropertyAssignmentAnalysis {
  /**
   * The literal discriminator value.
   */
  readonly kind: 'property'

  /**
   * The name of the property.
   */
  readonly name: string

  /**
   * The value expression of the property assignment.
   */
  readonly value: ExpressionAnalysis
}

/**
 * Represents an object literal spread assignment analysis containing a kind and expression.
 */
export interface ObjectLiteralSpreadAssignmentAnalysis {
  /**
   * The literal discriminator value.
   */
  readonly kind: 'spread'

  /**
   * The expression being spread.
   */
  readonly expression: ExpressionAnalysis
}

export interface ObjectLiteralMethodAnalysis {
  readonly kind: 'method'
  readonly method: NonDocumentableMethodMemberAnalysis | DocumentableMethodMemberAnalysis
}

/**
 * Represents an expression analysis for an object literal expression containing a kind and properties.
 */
export interface ObjectLiteralExpressionAnalysis {
  /**
   * The literal discriminator value.
   */
  readonly kind: 'object-literal'

  /**
   * The properties of the object literal.
   */
  readonly properties: ReadonlyArray<ObjectLiteralPropertyAnalysis>
}

/**
 * Defines a schema for object literal property assignment analysis.
 */
export const ObjectLiteralPropertyAssignmentAnalysis: Schema.Schema<ObjectLiteralPropertyAssignmentAnalysis> =
  Schema.Struct({
    kind: Schema.Literal('property'),
    name: Schema.String,
    value: Schema.suspend(() => ExpressionAnalysis),
  })

/**
 * Defines a schema for object literal spread assignment analysis.
 */
export const ObjectLiteralSpreadAssignmentAnalysis: Schema.Schema<ObjectLiteralSpreadAssignmentAnalysis> =
  Schema.Struct({
    kind: Schema.Literal('spread'),
    expression: Schema.suspend(() => ExpressionAnalysis),
  })

export const ObjectLiteralMethodAnalysis: Schema.Schema<ObjectLiteralMethodAnalysis> =
  Schema.Struct({
    kind: Schema.Literal('method'),
    method: Schema.Union([
      Schema.suspend(() => NonDocumentableMethodMemberAnalysis),
      Schema.suspend(() => DocumentableMethodMemberAnalysis),
    ]),
  })

/**
 * Defines a union schema for object literal property analyses.
 */
export const ObjectLiteralPropertyAnalysis: Schema.Schema<ObjectLiteralPropertyAnalysis> =
  Schema.Union([
    ObjectLiteralPropertyAssignmentAnalysis,
    ObjectLiteralSpreadAssignmentAnalysis,
    ObjectLiteralMethodAnalysis,
  ])

/**
 * Defines an expression analysis schema representing an object literal expression.
 */
export const ObjectLiteralExpressionAnalysis: Schema.Schema<ObjectLiteralExpressionAnalysis> =
  Schema.Struct({
    kind: Schema.Literal('object-literal'),
    properties: Schema.Array(ObjectLiteralPropertyAnalysis),
  }).pipe(
    Schema.annotate({
      description: 'An expression analysis representing an object literal expression.',
    }),
  )
