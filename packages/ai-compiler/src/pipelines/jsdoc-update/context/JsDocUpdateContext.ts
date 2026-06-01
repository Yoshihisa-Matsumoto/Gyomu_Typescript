import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript/index'

interface JsDocContextBase {
  project: {
    name: string
  }

  source: {
    relativePath: string
  }

  target: SymbolIdentity

  symbol: {
    name: string
    kind: string
  }

  code: {
    snippet?: string
  }

  existingJsDoc?: ExistingJsDoc
  relatedSymbols: Array<RelatedSymbol>
}

export interface ExistingJsDoc {
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

interface RelatedSymbol {
  name: string
  kind: string
  signature: string
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

  analysis?: {
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
