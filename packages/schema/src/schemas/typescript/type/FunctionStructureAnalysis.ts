import { Schema } from 'effect'
import { TypeProperty } from './TypeProperty.js'
import { TypeAnalysis } from './TypeAnalysis.js'

/**
 * Represents a function type structure.
 */
export type FunctionStructureAnalysis = {
  /**
   * The classification of this structure, which must be 'function'.
   */
  kind: 'function'

  /**
   * An array of parameters for the function.
   */
  parameters: ReadonlyArray<TypeProperty>

  /**
   * The return type of the function.
   */
  returnType: TypeAnalysis
}

/**
 * Represents a function type structure.
 */
export const FunctionStructureAnalysis: Schema.Schema<FunctionStructureAnalysis> = Schema.Struct({
  /**
   * The classification of this structure.
   */
  kind: Schema.Literal('function').annotate({
    description: 'The classification of this structure.',
  }),

  /**
   * Function parameters.
   */
  parameters: Schema.Array(Schema.suspend(() => TypeProperty)).annotate({
    description: 'Function parameters.',
  }),

  /**
   * The function\'s return type.
   */
  returnType: Schema.suspend(() => TypeAnalysis).annotate({
    description: "The function's return type.",
  }),
}).annotate({
  description: 'Represents a function type structure.',
})

// export type FunctionStructureAnalysis = typeof FunctionStructureAnalysis.Type
