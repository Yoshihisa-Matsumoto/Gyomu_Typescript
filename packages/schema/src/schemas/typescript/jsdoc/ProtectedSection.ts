import { Schema } from 'effect'

/**
 * Represents a section that is protected, including its identifier and associated priority score.
 */
export const ProtectedSection = Schema.Struct({
  targetSection: Schema.String.annotate({
    description: 'The identifier of the section to be protected.',
  }),

  score: Schema.Number.annotate({
    description:
      'A numeric score assigned to the protected section, typically representing priority or weight.',
  }),
}).annotate({
  description:
    'Represents a section that is protected, including its identifier and associated priority score.',
})

/**
 * The inferred type of the ProtectedSection schema.
 */
export type ProtectedSection = Schema.Schema.Type<typeof ProtectedSection>
