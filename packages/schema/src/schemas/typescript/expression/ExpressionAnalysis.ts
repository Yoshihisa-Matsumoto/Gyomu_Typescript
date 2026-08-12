import { Schema } from 'effect'
import { IdentifierExpressionAnalysis } from './Identifier.js'
import { SuperExpressionAnalysis, ThisExpressionAnalysis } from './Class.js'
import { PropertyAccessExpressionAnalysis } from './PropertyAccess.js'
import { ComputedAccessExpressionAnalysis } from './ComputedAccess.js'
import { CallExpressionAnalysis } from './Call.js'
import {
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

export type ExpressionAnalysis =
  | IdentifierExpressionAnalysis
  | StringLiteralExpressionAnalysis
  | NumericLiteralExpressionAnalysis
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

export const ExpressionAnalysis: Schema.Schema<ExpressionAnalysis> = Schema.Union([
  IdentifierExpressionAnalysis,
  StringLiteralExpressionAnalysis,
  NumericLiteralExpressionAnalysis,
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
]).pipe(
  Schema.annotate({
    description:
      'An analysis of an expression describing its structural form and referenced expressions.',
  }),
)
