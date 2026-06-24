export interface HumanEditSignal {
  type:
    | 'manual-format'
    | 'custom-section'
    | 'non-generated-tag'
    | 'complex-markdown'
    | 'custom-example'

  score: number
  details: {
    // tagName?: string
    pattern?: string
    source?: string
    targetSection: string
  }
}

export interface HumanEditContext {
  source: 'summary' | 'remarks' | 'example' | 'tag'

  tagName?: string
}
