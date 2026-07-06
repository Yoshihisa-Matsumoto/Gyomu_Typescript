import { Schema } from 'effect'

/**
 * Represents a marker identifying the tool and version used for generation, including the tool name, optional version, and the raw string representation.
 */
export const GeneratorMarker = Schema.Struct({
  tool: Schema.String.annotate({
    description: 'The name of the tool used for generation.',
  }),

  version: Schema.optional(
    Schema.String.annotate({
      description: 'Optional version of the tool used for generation.',
    }),
  ),

  raw: Schema.String.annotate({
    description: 'The raw string representation of the generator marker.',
  }),
}).annotate({
  description: 'Represents a marker identifying the tool and version used for generation.',
})

/**
 * The inferred type for the GeneratorMarker schema.
 */
export type GeneratorMarker = Schema.Schema.Type<typeof GeneratorMarker>
