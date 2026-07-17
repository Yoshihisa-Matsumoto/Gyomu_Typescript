import { Schema } from 'effect'

export const CapabilityConceptSchema = Schema.Struct({
  name: Schema.String.annotate({
    description:
      'Short capability name. Use 2-5 words. Examples: "Text Generation", "Schema Validation".',
  }),

  description: Schema.String.annotate({
    description: 'Brief explanation of what this capability provides to consumers of the package.',
  }),
})

export const PublicApiConceptSchema = Schema.Struct({
  exportedSymbol: Schema.String.annotate({
    description: 'Name of the exported symbol, module, or entry point.',
  }),

  purpose: Schema.String.annotate({
    description: 'Why this API exists and when users should use it.',
  }),
})

export const RelationshipConceptSchema = Schema.Struct({
  target: Schema.String.annotate({
    description: 'Name of the related package, project, or external system.',
  }),

  relationship: Schema.String.annotate({
    description:
      'Describe the relationship, such as depends on, provides services for, integrates with, or consumed by.',
  }),
})

export const PackageConceptSchema = Schema.Struct({
  summary: Schema.String.annotate({
    description:
      'High-level summary of the package. Write 2-4 concise sentences describing its primary purpose and overall role within the project.',
  }),

  responsibilities: Schema.Array(Schema.String).annotate({
    description:
      'List the primary responsibilities of this package. Focus on responsibilities rather than implementation details.',
  }),

  capabilities: Schema.Array(CapabilityConceptSchema).annotate({
    description:
      'Major capabilities provided by this package. Group related functionality into meaningful capabilities instead of listing every exported API.',
  }),

  publicApi: Schema.Array(PublicApiConceptSchema).annotate({
    description:
      'Most important public APIs exposed by this package. Include only the key exported symbols that consumers are expected to use.',
  }),

  relationships: Schema.Array(RelationshipConceptSchema).annotate({
    description:
      'Important relationships with other packages, modules, or external systems. Describe architectural relationships rather than implementation details.',
  }),

  designDecisions: Schema.Array(Schema.String).annotate({
    description:
      'Important architectural or design decisions that explain why the package is structured this way. Focus on stable design principles rather than temporary implementation choices.',
  }),

  usageGuidance: Schema.Array(Schema.String).annotate({
    description:
      'Recommendations and best practices for consumers of this package. Explain how the package is intended to be used.',
  }),

  outOfScope: Schema.Array(Schema.String).annotate({
    description:
      'Responsibilities or functionality intentionally excluded from this package. Clarify the package boundaries.',
  }),
})

export type PackageConcept = Schema.Schema.Type<typeof PackageConceptSchema>
