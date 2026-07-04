import { Schema } from 'effect'

export const JsDocReturns = Schema.Struct({
  description: Schema.optional(
    Schema.String.annotate({
      description: 'Optional description of the returned value.',
    }),
  ),

  raw: Schema.optional(
    Schema.String.annotate({
      description: 'The raw source text of the @returns tag.',
    }),
  ),
}).annotate({
  description: 'Represents a parsed @returns JSDoc tag.',
})

export type JsDocReturns = Schema.Schema.Type<typeof JsDocReturns>

export const JsDocThrows = Schema.Struct({
  type: Schema.optional(
    Schema.String.annotate({
      description: 'The type of the thrown error.',
    }),
  ),

  description: Schema.optional(
    Schema.String.annotate({
      description: 'Optional description of the error.',
    }),
  ),

  raw: Schema.optional(
    Schema.String.annotate({
      description: 'The raw source text of the @throws tag.',
    }),
  ),

  order: Schema.Number.annotate({
    description: 'The physical order of the tag within the JSDoc block.',
  }),
}).annotate({
  description: 'Represents a parsed @throws JSDoc tag.',
})

export type JsDocThrows = Schema.Schema.Type<typeof JsDocThrows>

export const JsDocParam = Schema.Struct({
  name: Schema.String.annotate({
    description: 'Parameter name.',
  }),

  type: Schema.optional(
    Schema.String.annotate({
      description: 'Parameter type as string, if available.',
    }),
  ),

  description: Schema.optional(
    Schema.String.annotate({
      description: 'Parameter description.',
    }),
  ),

  optional: Schema.optional(
    Schema.Boolean.annotate({
      description: 'Whether the parameter is optional.',
    }),
  ),

  raw: Schema.optional(
    Schema.String.annotate({
      description: 'Original raw tag text.',
    }),
  ),

  sortOrder: Schema.Number.annotate({
    description: 'Physical order within the block.',
  }),
}).annotate({
  description: 'Represents the parsed structure of a JSDoc parameter tag.',
})

export type JsDocParam = Schema.Schema.Type<typeof JsDocParam>

export const ParsedTag = Schema.Struct({
  tagName: Schema.String.annotate({
    description: `Tag name without '@'.

@example
'param'
'returns'
'remarks'`,
  }),

  key: Schema.optional(
    Schema.String.annotate({
      description: `Stable identifier used to distinguish tags that share the same tagName.

@example
- \`@template T\` -> key = "T"
- \`@template TResult\` -> key = "TResult"
- \`@param userId\` -> key = "userId"
- \`@throws ValidationError\` -> key = "ValidationError"

This value is used during merge planning and application to match
individual tags deterministically when multiple tags of the same
kind exist.

Undefined when the tag does not expose a natural identifier.`,
    }),
  ),

  text: Schema.optional(
    Schema.String.annotate({
      description: 'Raw tag content.',
    }),
  ),

  raw: Schema.optional(
    Schema.String.annotate({
      description: 'Original raw source.',
    }),
  ),

  sortOrder: Schema.Number.annotate({
    description: 'Physical order within the block.',
  }),
}).annotate({
  description: 'Represents a generic parsed JSDoc tag.',
})

export type ParsedTag = Schema.Schema.Type<typeof ParsedTag>
