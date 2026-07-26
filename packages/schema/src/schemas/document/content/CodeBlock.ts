import { Schema } from 'effect'

/**
 * Defines a schema for a source code block, including the language, the code itself, and an optional title.
 */
export const CodeBlock = Schema.Struct({
  type: Schema.Literal('code'),

  language: Schema.String.annotate({
    description: 'Programming or markup language.',
    examples: ['ts', 'bash', 'yaml'],
  }),

  code: Schema.String.annotate({
    description: 'Source code.',
  }),

  title: Schema.optional(Schema.String).annotate({
    description: 'Optional code block title.',
  }),
}).annotate({
  description: 'A source code block.',
})

/**
 * The TypeScript type inferred from the CodeBlock schema.
 */
export type CodeBlock = Schema.Schema.Type<typeof CodeBlock>
