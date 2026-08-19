import { Schema } from 'effect'
import { ExpressionAnalysis } from './ExpressionAnalysis.js'

/**
 * Defines the set of valid binary operators supported in expressions.
 */
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

/**
 * Represents a binary operator type.
 */
export type BinaryOperator = typeof BinaryOperator.Type

/**
 * Represents the analysis structure of a binary expression within a function body.
 */
export interface BinaryExpressionAnalysis {
  /**
   * The literal kind discriminator for binary expressions.
   */
  readonly kind: 'binary'

  /**
   * The left-hand side expression of the binary operation.
   */
  readonly left: ExpressionAnalysis

  /**
   * The right-hand side expression of the binary operation.
   */
  readonly right: ExpressionAnalysis

  /**
   * The binary operator used in the operation.
   */
  readonly operator: BinaryOperator
}

/**
 * Schema defining a binary expression analysis containing a kind, left and right expressions, and an operator.
 */
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

/**
 * Defines the set of valid assignment operators supported in expressions.
 */
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

/**
 * Represents an assignment operator type.
 */
export type AssignmentOperator = Schema.Schema.Type<typeof AssignmentOperator>

/**
 * Represents the analysis structure of an assignment expression within a function body.
 */
export interface AssignmentExpressionAnalysis {
  /**
   * The literal kind discriminator for assignment expressions.
   */
  readonly kind: 'assignment'

  /**
   * The left-hand side expression of the assignment operation.
   */
  readonly left: ExpressionAnalysis

  /**
   * The right-hand side expression of the assignment operation.
   */
  readonly right: ExpressionAnalysis

  /**
   * The assignment operator used in the operation.
   */
  readonly operator: AssignmentOperator
}

/**
 * Schema defining an assignment expression analysis containing a kind, left and right expressions, and an operator.
 */
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

/**
 * Represents the analysis structure of a conditional (ternary) expression within a function body.
 */
export interface ConditionalExpressionAnalysis {
  /**
   * The literal kind discriminator for conditional expressions.
   */
  readonly kind: 'conditional'
}

/**
 * Schema defining a conditional expression analysis containing its kind discriminator.
 */
export const ConditionalExpressionAnalysis: Schema.Schema<ConditionalExpressionAnalysis> =
  Schema.Struct({
    kind: Schema.Literal('conditional'),
  }).pipe(
    Schema.annotate({
      description:
        'An element representing a conditional (ternary) expression within a function body.',
    }),
  )
