import { Schema } from 'effect'

/**
 * Defines the schema for a single package capability, including its name and a brief functional description.
 */
export const CapabilityConceptSchema = Schema.Struct({
  name: Schema.String.annotate({
    description:
      'Short capability name. Use 2-5 words. Examples: "Text Generation", "Schema Validation".',
  }),

  description: Schema.String.annotate({
    description: 'Brief explanation of what this capability provides to consumers of the package.',
  }),
})

/**
 * Defines the schema for a relationship between the package and another entity, identifying the target and the nature of the association.
 */
export const RelationshipConceptSchema = Schema.Struct({
  target: Schema.String.annotate({
    description: 'Name of the related package, project, or external system.',
  }),

  relationship: Schema.String.annotate({
    description:
      'Describe the relationship, such as depends on, provides services for, integrates with, or consumed by.',
  }),
})

/**
 * Defines the complete schema for package concepts, including a high-level summary, responsibilities, architectural capabilities, design decisions, and usage guidance.
 */
export const PackageConceptSchema = Schema.Struct({
  summary: Schema.String.annotate({
    description:
      'High-level summary of the package. Write 2-4 concise sentences describing its primary purpose and overall role within the project.',
  }),

  responsibilities: Schema.Array(Schema.String).annotate({
    description: `
- What the package is responsible for within the system
- Not APIs
- Not implementation
- Long-term architectural responsibilities
- 3-6 items

Examples:
- Define business domain schemas.
- Model TypeScript source code structures.
- Provide shared validation models.

`,
  }),

  capabilities: Schema.Array(CapabilityConceptSchema).annotate({
    description: `
- What consumers can accomplish
- Cohesive feature areas
- Group multiple related APIs
- Capability names should be concise nouns or noun phrases that describe a feature area, not an implementation mechanism.
- Do not list exported symbols
- Do not repeat responsibilities
- 3-8 items

Examples:
- Business Entity Schemas
- AI Conversation Models
- Type Analysis Framework

`,
  }),

  designDecisions: Schema.Array(Schema.String).annotate({
    description:
      'Important architectural or design decisions that explain why the package is structured this way. Focus on stable design principles rather than temporary implementation choices.',
  }),

  usageGuidance: Schema.Array(Schema.String).annotate({
    description:
      'Recommendations and best practices for consumers of this package. Explain how the package is intended to be used.',
  }),
})

/**
 * Represents the inferred type structure for package insights derived from PackageInsightSchema.
 */
export type PackageConcept = Schema.Schema.Type<typeof PackageConceptSchema>
