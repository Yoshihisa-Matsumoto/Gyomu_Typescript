import { Schema } from 'effect'
import { FunctionBodyElement } from '../FunctionBodyElement.js'
import { FunctionBodyElementBase } from './FunctionBodyElementBase.js'

/**
 * Represents a block statement within a function body, containing an ordered collection of child elements.
 */
export interface FunctionBodyBlock extends FunctionBodyElementBase {
  /**
   * Discriminant property indicating the element type is a block.
   */
  readonly kind: 'block'

  /**
   * The list of child elements contained within the block statement.
   */
  readonly children: ReadonlyArray<FunctionBodyElement>
}

/**
 * An element representing a block statement within a function body, containing an array of child elements.
 */
export const FunctionBodyBlock: Schema.Schema<FunctionBodyBlock> = Schema.Struct({
  kind: Schema.Literal('block'),
  children: Schema.Array(Schema.suspend(() => FunctionBodyElement)),
}).pipe(
  Schema.fieldsAssign(FunctionBodyElementBase.fields),
  Schema.annotate({
    description: 'An element representing a block statement within a function body.',
  }),
)
