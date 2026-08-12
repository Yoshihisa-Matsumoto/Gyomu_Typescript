import { Schema } from 'effect'
import { ExpressionAnalysis } from './ExpressionAnalysis.js'

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

export interface ObjectLiteralPropertyAnalysis {
  readonly kind: 'property'
  readonly name: string
  readonly value: ExpressionAnalysis
}
export interface ObjectLiteralExpressionAnalysis {
  readonly kind: 'object-literal'
  readonly properties: ReadonlyArray<ObjectLiteralPropertyAnalysis>
}

export const ObjectLiteralPropertyAnalysis: Schema.Schema<ObjectLiteralPropertyAnalysis> =
  Schema.Struct({
    kind: Schema.Literal('property'),
    name: Schema.String,
    value: Schema.suspend(() => ExpressionAnalysis),
  })

export const ObjectLiteralExpressionAnalysis: Schema.Schema<ObjectLiteralExpressionAnalysis> =
  Schema.Struct({
    kind: Schema.Literal('object-literal'),
    properties: Schema.Array(ObjectLiteralPropertyAnalysis),
  }).pipe(
    Schema.annotate({
      description: 'An expression analysis representing an object literal expression.',
    }),
  )
