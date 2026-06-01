import { Confidence } from '@gyomu/schema/schemas/Confidence'
import { Schema } from 'effect'

export const MergeAction = Schema.Literals(['replace', 'preserve', 'merge']).annotate({
  description:
    'Action for merging JSDoc elements. replace = overwrite, preserve = keep existing, merge = combine intelligently',
})

export const SummaryPlan = Schema.Struct({
  action: MergeAction,

  value: Schema.optional(Schema.String).annotate({
    description: 'Generated or updated summary text when action is replace',
  }),

  confidence: Confidence,
}).annotate({
  description: 'Update plan for JSDoc summary field',
})

export const JsDocTarget = Schema.Struct({
  kind: Schema.Literals(['summary', 'param', 'return', 'tag']),

  // AST or symbolレベルの安定ID
  symbolId: Schema.String,

  // optional: overload / signature disambiguation
  signatureId: Schema.optional(Schema.String),

  // param/tagの追加識別子
  key: Schema.optional(Schema.String),
}).annotate({
  description: 'Stable target reference for deterministic JsDoc application',
})

export const ParamPlan = Schema.Struct({
  target: JsDocTarget,

  name: Schema.String.annotate({
    description: 'Parameter name from function signature',
  }),

  action: MergeAction,

  value: Schema.optional(
    Schema.Struct({
      type: Schema.optional(Schema.String).annotate({
        description: 'Type hint of parameter',
      }),

      description: Schema.optional(Schema.String).annotate({
        description: 'Human-readable meaning of parameter',
      }),
    }),
  ).annotate({
    description: 'Updated parameter metadata when action is replace or merge',
  }),

  confidence: Confidence,
}).annotate({
  description: 'Update plan for a single function parameter',
})

export const ReturnPlan = Schema.Struct({
  action: MergeAction,

  value: Schema.optional(Schema.String).annotate({
    description: 'Return value description when replacing',
  }),

  confidence: Confidence,
}).annotate({
  description: 'Update plan for return JSDoc field',
})

export const TagPlan = Schema.Struct({
  target: JsDocTarget,

  tag: Schema.String.annotate({
    description: 'JSDoc tag name (e.g. @throws, @template)',
  }),

  action: MergeAction,

  value: Schema.optional(
    Schema.Struct({
      content: Schema.optional(Schema.String).annotate({
        description: 'Tag content text',
      }),
    }),
  ).annotate({
    description: 'Updated tag content when needed',
  }),

  confidence: Confidence,
}).annotate({
  description: 'Generic JSDoc tag update plan',
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

export const JsDocUpdatePlanSchema = Schema.Struct({
  summary: SummaryPlan,
  params: Schema.Array(ParamPlan),
  returns: ReturnPlan,
  tags: Schema.Array(TagPlan),
  order: Schema.optional(Schema.Array(Schema.Literals(['summary', 'params', 'returns', 'tags']))),
  reasoning: Reasoning,
  risk: Risk,
}).annotate({
  description: 'AI-generated structured plan for safely updating JSDoc',
})

export type JsDocUpdatePlan = Schema.Schema.Type<typeof JsDocUpdatePlanSchema>
