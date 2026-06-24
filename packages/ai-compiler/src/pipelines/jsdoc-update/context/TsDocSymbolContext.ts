import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript/index'
import type { EffectSignals } from '@gyomu/schema/typescript'

/**
 * Defines the base interface for a JSDoc update context containing project metadata and target identification.
 */
export interface TsDocSymbolContext {
  /**
   * The specific symbol identity targeted for the JSDoc update.
   */
  target: SymbolIdentity

  /**
   * The metadata of the targeted symbol.
   */
  symbol: {
    name: string
    kind: string
  }

  /**
   * Container for the code snippet information.
   */
  code: {
    snippet?: string
  }

  /**
   * Optional existing JSDoc documentation for the target symbol.
   */
  existingJsDoc?: ExistingJsDoc

  /**
   * The optional effect type declaration
   */
  effectSignals: Pick<EffectSignals, 'success' | 'error' | 'requirements'> | undefined

  /**
   * List of related symbols to be documented.
   */
  relatedSymbols: Array<RelatedSymbol>

  /**
   * List of documentable child members.
   */
  children?: Array<ContextEntry>

  /**
   * Deep analysis metadata for code refinement.
   */
  analysis?: {
    paramSemantics: Array<{
      name: string
      meaning: string
      role: string
    }>

    protectedRegions: Array<ProtectedSection>

    returnSemantics?: string

    sideEffects: Array<string>

    schemaStructure?: SchemaStructureNode
  }

  /**
   * Configuration and metrics regarding how the symbol is used.
   */
  usageContext?: {
    publicApi: boolean
    usedAcrossModules: boolean
    callSites?: number
  }
}

export type NonDocumentableReason =
  | 'inline-object-member'
  | 'generated'
  | 'external'
  | 'non-documentable-member'

export type DocumentableInfo =
  | {
      documentable?: true
      reason?: never
    }
  | {
      documentable: false
      reason: NonDocumentableReason
    }

/**
 * Represents an entry in the JSDoc update context, defining a target symbol and its associated metadata.
 */
export type ContextEntry = {
  /**
   * The target symbol identity to be documented.
   */
  target: SymbolIdentity

  /**
   * The name of the symbol.
   */
  name: string

  /**
   * The category of the symbol.
   */
  kind: 'property' | 'method' | 'parameter' | 'type'

  /**
   * The optional type definition of the symbol.
   */
  type?: string

  /**
   * Existing JSDoc content associated with the symbol, if any.
   */
  existingJsDoc?: ExistingJsDoc

  /**
   * The optional effect type declaration
   */
  effectSignals: Pick<EffectSignals, 'success' | 'error' | 'requirements'> | undefined

  /**
   * Child entries nested under this symbol.
   */
  children?: Array<ContextEntry>
} & DocumentableInfo

/**
 * Represents the existing JSDoc documentation structure for a symbol.
 */
export interface ExistingJsDoc {
  /**
   * The JSDoc summary text, if present.
   */
  summary?: string

  /**
   * An array of parameter documentation entries.
   */
  params: Array<{
    name: string
    sortOrder: number
    type?: string
    description?: string
  }>

  /**
   * The return value documentation, if present.
   */
  returns?: string

  /**
   * An array of additional JSDoc tags.
   */
  tags: Array<{
    tag: string
    content: string
    sortOrder: number
  }>
}

interface RelatedSymbol {
  name: string
  kind: string
  signature: string
}

export interface SchemaStructureNode {
  name: string

  kind: 'property' | 'object' | 'array' | 'union' | 'primitive' | 'reference' | 'literal'

  type?: string

  semanticHint?: string

  children?: Array<SchemaStructureNode>
}

/**
 * Represents a section of code or documentation that should be protected from automatic modification.
 */
export interface ProtectedSection {
  /**
   * The type of section being protected.
   */
  kind: 'summary' | 'param' | 'returns' | 'tag'

  /**
   * Optional identifier for the section.
   */
  key?: string

  /**
   * The reason why the section is protected.
   */
  reason: 'preserve-marker' | 'human-edited' | 'custom-content'
}
