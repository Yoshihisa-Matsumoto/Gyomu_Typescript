import { Schema } from 'effect'
import { ExpressionAnalysis } from './ExpressionAnalysis.js'

export const NullKeyword = Schema.Struct({ kind: Schema.Literal('null') }).pipe(
  Schema.annotate({ description: 'null keyword' }),
)
export type NullKeyword = Schema.Schema.Type<typeof NullKeyword>
export interface StringLiteralExpressionAnalysis {
  readonly kind: 'string-literal'
  readonly value: string
}

export const StringLiteralExpressionAnalysis: Schema.Schema<StringLiteralExpressionAnalysis> =
  Schema.Struct({
    kind: Schema.Literal('string-literal'),
    value: Schema.String,
  }).pipe(
    Schema.annotate({
      description: 'An expression analysis representing an string literal reference.',
    }),
  )

export interface NumericLiteralExpressionAnalysis {
  readonly kind: 'numeric-literal'
  readonly value: number
}

export const NumericLiteralExpressionAnalysis: Schema.Schema<NumericLiteralExpressionAnalysis> =
  Schema.Struct({
    kind: Schema.Literal('numeric-literal'),
    value: Schema.Number,
  }).pipe(
    Schema.annotate({
      description: 'An expression analysis representing an numeric literal reference.',
    }),
  )

export interface ArrayLiteralExpressionAnalysis {
  readonly kind: 'array-literal'
  readonly value: ReadonlyArray<ExpressionAnalysis>
}
export const ArrayLiteralExpressionAnalysis: Schema.Schema<ArrayLiteralExpressionAnalysis> =
  Schema.Struct({
    kind: Schema.Literal('array-literal'),
    value: Schema.Array(Schema.suspend(() => ExpressionAnalysis)),
  }).pipe(
    Schema.annotate({
      description: 'An expression analysis representing an array literal reference.',
    }),
  )

export type ObjectLiteralPropertyAnalysis =
  ObjectLiteralPropertyAssignmentAnalysis | ObjectLiteralSpreadAssignmentAnalysis

export interface ObjectLiteralPropertyAssignmentAnalysis {
  readonly kind: 'property'
  readonly name: string
  readonly value: ExpressionAnalysis
}

export interface ObjectLiteralSpreadAssignmentAnalysis {
  readonly kind: 'spread'
  readonly expression: ExpressionAnalysis
}
export interface ObjectLiteralExpressionAnalysis {
  readonly kind: 'object-literal'
  readonly properties: ReadonlyArray<ObjectLiteralPropertyAnalysis>
}

export const ObjectLiteralPropertyAssignmentAnalysis: Schema.Schema<ObjectLiteralPropertyAssignmentAnalysis> =
  Schema.Struct({
    kind: Schema.Literal('property'),
    name: Schema.String,
    value: Schema.suspend(() => ExpressionAnalysis),
  })

export const ObjectLiteralSpreadAssignmentAnalysis: Schema.Schema<ObjectLiteralSpreadAssignmentAnalysis> =
  Schema.Struct({
    kind: Schema.Literal('spread'),
    expression: Schema.suspend(() => ExpressionAnalysis),
  })

export const ObjectLiteralPropertyAnalysis: Schema.Schema<ObjectLiteralPropertyAnalysis> =
  Schema.Union([ObjectLiteralPropertyAssignmentAnalysis, ObjectLiteralSpreadAssignmentAnalysis])

export const ObjectLiteralExpressionAnalysis: Schema.Schema<ObjectLiteralExpressionAnalysis> =
  Schema.Struct({
    kind: Schema.Literal('object-literal'),
    properties: Schema.Array(ObjectLiteralPropertyAnalysis),
  }).pipe(
    Schema.annotate({
      description: 'An expression analysis representing an object literal expression.',
    }),
  )
