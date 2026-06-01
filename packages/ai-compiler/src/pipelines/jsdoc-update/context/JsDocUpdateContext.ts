interface JsDocContextBase {
  project: {
    name: string
  }

  source: {
    relativePath: string
  }

  symbol: {
    name: string
    kind: string
    signature: string
  }

  code: {
    fullSnippet: string
    bodySnippet: string
  }

  existingJsDoc: {
    summary?: string
    params: Array<{
      name: string
      type?: string
      description?: string
    }>
    returns?: string
    tags: Array<{
      tag: string
      content: string
    }>
  }
}

export interface LightJsDocContext extends JsDocContextBase {
  mode: 'light'

  analysis?: {
    inferredSummary?: string
  }

  options: {
    preserveStyle: true
  }
}

export interface DeepJsDocContext extends JsDocContextBase {
  mode: 'deep'

  analysis: {
    intentSummary: string
    designPurpose: string

    paramSemantics: Array<{
      name: string
      meaning: string
      role: string
    }>

    protectedRegions: Array<ProtectedSection>

    returnSemantics?: string

    sideEffects: Array<string>
  }

  usageContext?: {
    publicApi: boolean
    usedAcrossModules: boolean
    callSites?: number
  }

  options: {
    requireHighQuality: true
    allowRewrite: true
  }
}

export interface ProtectedSection {
  kind: 'summary' | 'param' | 'returns' | 'tag'

  key?: string

  reason: 'preserve-marker' | 'human-edited' | 'custom-content'
}

export type JsDocUpdateContext = LightJsDocContext | DeepJsDocContext
