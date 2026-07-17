import { Confidence } from '@gyomu/schema/schemas'
import { SymbolIdentity } from '@gyomu/schema/schemas/typescript'
import { Schema } from 'effect'

export const MergeActionSchema = Schema.Union([
  Schema.Struct({
    type: Schema.Literal('replace'),
    value: Schema.String,
  }).annotate({
    description:
      'Replace the existing content with the provided value. The value must contain the final content to apply.',
  }),

  Schema.Struct({
    type: Schema.Literal('preserve'),
  }).annotate({
    description:
      'Keep the existing content unchanged. Use when the current documentation is already adequate or uncertainty is high.',
  }),

  Schema.Struct({
    type: Schema.Literal('delete'),
  }).annotate({
    description:
      'Delete the existing content. Use only when the documented element no longer exists or the documentation is clearly invalid.',
  }),
]).annotate({
  description:
    'Deterministic JSDoc update action. All replacement content must be embedded directly in the action so that application does not require additional context.',
})

export const SummaryPlan = Schema.Struct({
  action: MergeActionSchema,
  confidence: Confidence,
}).annotate({
  description:
    'Update plan for the summary section. Prefer preserve. Use replace only when the summary is missing or clearly incorrect.',
})

const TagKind = Schema.Literals([
  'summary',
  'param',
  'return',
  'template',
  'throws',
  'remarks',
  'other',
])
export const isJsDocTargetKind = (value: string) => Schema.is(TagKind)(value)

export const JsDocTargetSchema = Schema.Struct({
  kind: TagKind,

  // param/tagの追加識別子
  key: Schema.NullOr(Schema.String),
}).annotate({
  description: 'Stable target reference for deterministic JsDoc application',
})

const ParamActionValueSchema = Schema.Struct({
  type: Schema.NullOr(Schema.String).annotate({
    description: 'Type hint of parameter',
  }),

  description: Schema.NullOr(Schema.String).annotate({
    description:
      'Complete replacement parameter metadata. When using replace, provide the final parameter documentation to be written.',
  }),
})

export const ParamMergeActionSchema = Schema.Union([
  Schema.Struct({
    type: Schema.Literal('replace'),
    value: ParamActionValueSchema,
  }).annotate({
    description:
      'Replace the existing content with the provided value. The value must contain the final content to apply.',
  }),

  Schema.Struct({
    type: Schema.Literal('preserve'),
  }).annotate({
    description:
      'Keep the existing content unchanged. Use when the current documentation is already adequate or uncertainty is high.',
  }),

  Schema.Struct({
    type: Schema.Literal('delete'),
  }).annotate({
    description:
      'Delete the existing content. Use only when the documented element no longer exists or the documentation is clearly invalid.',
  }),
]).annotate({
  description:
    'Deterministic JSDoc update action. All replacement content must be embedded directly in the action so that application does not require additional context.',
})

export const ParamPlan = Schema.Struct({
  target: JsDocTargetSchema,

  name: Schema.String.annotate({
    description: 'Parameter name from function signature',
  }),

  sortOrder: Schema.Number.annotate({
    description:
      'Parameter position in the function signature. The first parameter should have the lowest sortOrder. Preserve signature order when generating update plans.',
  }),

  action: ParamMergeActionSchema,

  confidence: Confidence,
}).annotate({
  description:
    'Parameter update plan. Delete only when the parameter no longer exists in the function signature. Preserve when unsure.',
})

export const ReturnPlan = Schema.Struct({
  action: MergeActionSchema,

  confidence: Confidence,
}).annotate({
  description:
    'Return documentation update plan. Delete only when the function no longer returns a meaningful value.',
})

export const TagPlan = Schema.Struct({
  target: JsDocTargetSchema,

  tag: Schema.String.annotate({
    description: 'JSDoc tag name (e.g. @throws, @template)',
  }),

  sortOrder: Schema.Number.annotate({
    description:
      'Stable ordering index for JSDoc tags. Preserve existing tag order whenever possible. New tags should be assigned a deterministic position relative to existing tags.',
  }),

  action: MergeActionSchema,

  confidence: Confidence,
}).annotate({
  description:
    'Generic JSDoc tag update plan. Existing tags should normally be preserved. Delete only when the tag is clearly obsolete or invalid.',
})

export const Reasoning = Schema.Struct({
  summary: Schema.String.annotate({
    description: 'Why this update strategy was chosen',
  }),

  paramMapping: Schema.String.annotate({
    description: 'How parameters were interpreted and mapped',
  }),

  returnMapping: Schema.String.annotate({
    description: 'How return type was interpreted',
  }),
}).annotate({
  description: 'AI reasoning trace for debugging and validation',
})

export const Risk = Schema.Struct({
  hasHumanConflict: Schema.Boolean.annotate({
    description: 'Whether AI detected conflict with human-edited content',
  }),

  riskLevel: Schema.Literals(['low', 'medium', 'high']).annotate({
    description: 'Risk level of applying this update plan',
  }),
}).annotate({
  description: 'Safety risk assessment for merge operation',
})

export const JsDocUpdateEntrySchema = Schema.Struct({
  identity: SymbolIdentity,
  summary: SummaryPlan,
  params: Schema.Array(ParamPlan),
  returns: ReturnPlan,
  tags: Schema.Array(TagPlan),
  order: Schema.optional(Schema.Array(Schema.Literals(['summary', 'params', 'returns', 'tags']))),
  reasoning: Reasoning,
  risk: Risk,
}).annotate({
  description: `
AI-generated structured plan for safely updating JSDoc.

Prefer preserve over replace.
Prefer replace over delete.

Delete actions should be rare and only used when the documented target no longer exists or the documentation is clearly invalid.

All replacement content must be included directly in the plan so that application can be performed without access to the original update context.
`,
})
export const JsDocUpdatePlanSchema = Schema.Array(JsDocUpdateEntrySchema).annotate({
  description: `
Collection of JSDoc update plans.

The first entry typically represents the requested target symbol.
Additional entries may represent documentable child members or nested symbols.

Each entry is applied independently using its identity.
`,
})
export type ParamMergeAction = Schema.Schema.Type<typeof ParamMergeActionSchema>
export type MergeAction = Schema.Schema.Type<typeof MergeActionSchema>
export type JsDocUpdatePlan = Schema.Schema.Type<typeof JsDocUpdatePlanSchema>
export type JsDocUpdateEntryPlan = Schema.Schema.Type<typeof JsDocUpdateEntrySchema>
export type JsDocTarget = Schema.Schema.Type<typeof JsDocTargetSchema>
export type ParamActionValue = Schema.Schema.Type<typeof ParamActionValueSchema>
