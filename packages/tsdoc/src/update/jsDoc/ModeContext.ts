export interface ModeContext {
  file: {
    defaultMode: 'light' | 'deep'
    hasGeneratedJsDoc: boolean
    stabilityScore: number
  }

  symbol: {
    exported: boolean
    publicApi: boolean
    hasJsDoc: boolean
    humanEdited: boolean
    complexityScore: number
  }
}
