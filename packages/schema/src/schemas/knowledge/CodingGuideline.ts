import { Schema } from 'effect'

/**
 * Defines a coding guideline rule containing a category, the rule description, and an optional rationale.
 */
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

/**
 * Defines a schema for coding guidelines and rules for AI-assisted development, including display name, principles, rules, and forbidden practices.
 */
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

/**
 * Represents the inferred type of a coding guideline.
 */
export type CodingGuideline = Schema.Schema.Type<typeof CodingGuideline>
