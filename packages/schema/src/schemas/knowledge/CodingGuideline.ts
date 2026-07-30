import { Schema } from 'effect'

export const CodingRule = Schema.Struct({
  category: Schema.String.annotate({
    description: 'Category of the coding guideline.',
  }),

  rule: Schema.String.annotate({
    description: 'The coding rule to follow.',
  }),

  rationale: Schema.optional(
    Schema.String.annotate({
      description: 'Reason why the rule exists.',
    }),
  ),
}).annotate({
  description: 'A coding guideline rule.',
})

export const CodingGuideline = Schema.Struct({
  displayName: Schema.String,

  principles: Schema.Array(Schema.String).annotate({
    description: 'Fundamental coding principles.',
  }),

  rules: Schema.Array(CodingRule).annotate({
    description: 'Actionable coding rules.',
  }),

  forbidden: Schema.Array(Schema.String).annotate({
    description: 'Forbidden coding practices.',
  }),
}).annotate({
  description: 'Coding guidelines and rules for AI-assisted development.',
})

export type CodingGuideline = Schema.Schema.Type<typeof CodingGuideline>
