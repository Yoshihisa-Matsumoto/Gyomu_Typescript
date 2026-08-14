import { Schema } from 'effect'
import { IdentifierExpressionAnalysis } from './Identifier.js'
import { SuperExpressionAnalysis, ThisExpressionAnalysis } from './Class.js'
import { PropertyAccessExpressionAnalysis } from './PropertyAccess.js'
import { ComputedAccessExpressionAnalysis } from './ComputedAccess.js'
import { CallExpressionAnalysis } from './Call.js'
import {
  ArrayLiteralExpressionAnalysis,
  NullKeyword,
  NumericLiteralExpressionAnalysis,
  ObjectLiteralExpressionAnalysis,
  StringLiteralExpressionAnalysis,
} from './Literal.js'
import { NewExpressionAnalysis } from './New.js'
import {
  AssignmentExpressionAnalysis,
  BinaryExpressionAnalysis,
  ConditionalExpressionAnalysis,
} from './Binary.js'
import { AwaitExpressionAnalysis } from './Await.js'
import { UnaryExpressionAnalysis } from './Unary.js'
import { YieldExpressionAnalysis } from './Yield.js'
import { FunctionExpressionAnalysis } from './Function.js'
import { AsExpressionAnalysis } from './As.js'
import { TypeOfExpressionAnalysis } from './TypeOf.js'

/**
 * Represents an analysis of an expression, describing its structural form and referenced expressions across various expression types.
 */
export type ExpressionAnalysis =
  | IdentifierExpressionAnalysis
  | StringLiteralExpressionAnalysis
  | NumericLiteralExpressionAnalysis
  | ArrayLiteralExpressionAnalysis
  | ObjectLiteralExpressionAnalysis
  | ThisExpressionAnalysis
  | SuperExpressionAnalysis
  | PropertyAccessExpressionAnalysis
  | ComputedAccessExpressionAnalysis
  | CallExpressionAnalysis
  | NewExpressionAnalysis
  | BinaryExpressionAnalysis
  | AssignmentExpressionAnalysis
  | ConditionalExpressionAnalysis
  | AwaitExpressionAnalysis
  | UnaryExpressionAnalysis
  | YieldExpressionAnalysis
  | FunctionExpressionAnalysis
  | AsExpressionAnalysis
  | NullKeyword
  | TypeOfExpressionAnalysis

/**
 * Schema for ExpressionAnalysis, representing an analysis of an expression describing its structural form and referenced expressions.
 */
export const ExpressionAnalysis: Schema.Schema<ExpressionAnalysis> = Schema.Union([
  IdentifierExpressionAnalysis,
  StringLiteralExpressionAnalysis,
  NumericLiteralExpressionAnalysis,
  ArrayLiteralExpressionAnalysis,
  ObjectLiteralExpressionAnalysis,
  ThisExpressionAnalysis,
  SuperExpressionAnalysis,
  PropertyAccessExpressionAnalysis,
  ComputedAccessExpressionAnalysis,
  CallExpressionAnalysis,
  NewExpressionAnalysis,
  BinaryExpressionAnalysis,
  AssignmentExpressionAnalysis,
  ConditionalExpressionAnalysis,
  AwaitExpressionAnalysis,
  UnaryExpressionAnalysis,
  YieldExpressionAnalysis,
  FunctionExpressionAnalysis,
  AsExpressionAnalysis,
  NullKeyword,
  TypeOfExpressionAnalysis,
]).pipe(
  Schema.annotate({
    description:
      'An analysis of an expression describing its structural form and referenced expressions.',
  }),
)
