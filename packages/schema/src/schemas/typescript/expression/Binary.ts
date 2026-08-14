import { Schema } from 'effect'
import { ExpressionAnalysis } from './ExpressionAnalysis.js'

export const BinaryOperator = Schema.Literals([
  '==',
  '!=',
  '===',
  '!==',
  '<',
  '<=',
  '>',
  '>=',
  'in',
  'instanceof',
  '+',
  '-',
  '*',
  '/',
  '%',
  '**',
  '<<',
  '>>',
  '>>>',
  '&',
  '^',
  '|',
  '&&',
  '||',
  '??',
])
export type BinaryOperator = typeof BinaryOperator.Type
export interface BinaryExpressionAnalysis {
  readonly kind: 'binary'
  readonly left: ExpressionAnalysis
  readonly right: ExpressionAnalysis
  readonly operator: BinaryOperator
}
export const BinaryExpressionAnalysis: Schema.Schema<BinaryExpressionAnalysis> = Schema.Struct({
  kind: Schema.Literal('binary'),
  left: Schema.suspend(() => ExpressionAnalysis),
  right: Schema.suspend(() => ExpressionAnalysis),
  operator: BinaryOperator,
}).pipe(
  Schema.annotate({
    description: 'An element representing a binary operation within a function body.',
  }),
)

export const AssignmentOperator = Schema.Literals([
  '=',
  '+=',
  '-=',
  '*=',
  '/=',
  '%=',
  '**=',
  '<<=',
  '>>=',
  '>>>=',
  '&=',
  '^=',
  '|=',
  '&&=',
  '||=',
  '??=',
])
export type AssignmentOperator = Schema.Schema.Type<typeof AssignmentOperator>

export interface AssignmentExpressionAnalysis {
  readonly kind: 'assignment'
  readonly left: ExpressionAnalysis
  readonly right: ExpressionAnalysis
  readonly operator: AssignmentOperator
}

export const AssignmentExpressionAnalysis: Schema.Schema<AssignmentExpressionAnalysis> =
  Schema.Struct({
    kind: Schema.Literal('assignment'),
    left: Schema.suspend(() => ExpressionAnalysis),
    right: Schema.suspend(() => ExpressionAnalysis),
    operator: AssignmentOperator,
  }).pipe(
    Schema.annotate({
      description: 'An element representing an assignment operation within a function body.',
    }),
  )

export interface ConditionalExpressionAnalysis {
  readonly kind: 'conditional'
}
export const ConditionalExpressionAnalysis: Schema.Schema<ConditionalExpressionAnalysis> =
  Schema.Struct({
    kind: Schema.Literal('conditional'),
  }).pipe(
    Schema.annotate({
      description:
        'An element representing a conditional (ternary) expression within a function body.',
    }),
  )
