import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript/index'

/**
 * Defines the base interface for a JSDoc update context containing project metadata and target identification.
 */
export interface JsDocContextBase {
  /**
   * Determines whether the update mode is 'light' or 'deep'.
   */
  mode: 'light' | 'deep'

  /**
   * Contains project-level configuration information.
   */
  project: {
    name: string
  }

  /**
   * Specifies information about the source file being processed.
   */
  source: {
    relativePath: string
  }

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
   * List of related symbols to be documented.
   */
  relatedSymbols: Array<RelatedSymbol>

  /**
   * List of documentable child members.
   */
  children?: Array<ContextEntry>
}

/**
 * Represents an entry in the JSDoc update context, defining a target symbol and its associated metadata.
 */
export interface ContextEntry {
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
   * Child entries nested under this symbol.
   */
  children?: Array<ContextEntry>
}

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

/**
 * Represents a light JSDoc update context configuration.
 */
export interface LightJsDocContext extends JsDocContextBase {
  /**
   * The mode of the compiler, forced to 'light'.
   */
  mode: 'light'

  /**
   * Configuration options for the update process.
   */
  options: {
    /**
     * Whether to preserve original code style during updates.
     */
    preserveStyle: true
  }
}

/**
 * Extends JsDocContextBase with deep analysis metadata and strict usage configuration.
 */
export interface DeepJsDocContext extends JsDocContextBase {
  /**
   * The deep mode indicator, fixed to 'deep'.
   */
  mode: 'deep'

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
  }

  /**
   * Configuration and metrics regarding how the symbol is used.
   */
  usageContext?: {
    publicApi: boolean
    usedAcrossModules: boolean
    callSites?: number
  }

  /**
   * Strict behavioral options for the AI compiler process.
   */
  options: {
    requireHighQuality: true
    allowRewrite: true
  }
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

/**
 * Context for updating JSDoc, supporting either light or deep update strategies.
 */
export type JsDocUpdateContext = LightJsDocContext | DeepJsDocContext
