import type {
  DependencySummary,
  EffectSignals,
  SchemaAnnotations,
  SymbolIdentity,
} from '@gyomu/schema/schemas/typescript'

/**
 * Defines the base interface for a JSDoc update context containing project metadata and target identification.
 *
 * @returns Defines the base interface for a JSDoc update context containing project metadata and target identification.
 */
export interface TsDocSymbolContext {
  /**
   * The specific symbol identity targeted for the JSDoc update.
   *
   * @returns The specific symbol identity targeted for the JSDoc update.
   */
  target: SymbolIdentity

  /**
   * The metadata of the targeted symbol.
   *
   * @returns Metadata describing the targeted symbol.
   */
  symbol: {
    /**
     * The name of the targeted symbol.
     *
     * @returns The name of the targeted symbol.
     */
    name: string

    /**
     * The classification kind of the targeted symbol.
     *
     * @returns The classification kind of the targeted symbol.
     */
    kind: string
  }

  /**
   * Container for the code snippet information.
   *
   * @returns Container for the code snippet information.
   */
  code: {
    /**
     * The source code snippet for the symbol.
     *
     * @returns The source code snippet for the symbol.
     */
    snippet?: string
  }

  /**
   * Optional existing JSDoc documentation for the target symbol.
   *
   * @returns The optional pre-existing JSDoc documentation for the target.
   */
  existingJsDoc: ExistingJsDoc | undefined

  /**
   * The optional effect type declaration
   *
   * @returns Optional effect signal configuration containing success, error, and requirement states.
   */
  effectSignals: Pick<EffectSignals, 'success' | 'error' | 'requirements'> | undefined

  /**
   * List of related symbols to be documented.
   *
   * @returns Collection of related symbols for documentation reference.
   */
  relatedSymbols: Array<RelatedSymbol>

  /**
   * List of documentable child members.
   *
   * @returns List of child members to be documented as nested nodes.
   */
  children?: Array<ContextEntry>

  /**
   * Deep analysis metadata for code refinement.
   *
   * @returns Deep analysis metadata used for automated code refinement.
   */
  analysis:
    | {
        paramSemantics: Array<{
          name: string
          meaning: string
          role: string
        }>

        // protectedRegions: Array<ProtectedSection>

        returnSemantics?: string

        sideEffects: Array<string>

        schemaStructure?: SchemaStructureNode
      }
    | undefined

  /**
   * Optional dependency analysis for the targeted symbol.
   *
   * @returns Optional dependency analysis for the targeted symbol.
   */
  dependencies:
    | {
        candidates: ReadonlyArray<DependencySummary>
      }
    | undefined

  /**
   * Configuration and metrics regarding how the symbol is used.
   *
   * @returns Configuration metrics detailing symbol usage and scope.
   */
  usageContext?: {
    /**
     * Indicator of whether the symbol is part of the public API.
     *
     * @returns Indicator of whether the symbol is part of the public API.
     */
    publicApi: boolean

    /**
     * Indicator of whether the symbol is consumed across different modules.
     *
     * @returns Indicator of whether the symbol is consumed across different modules.
     */
    usedAcrossModules: boolean

    /**
     * The count of detected call sites for the symbol.
     *
     * @returns The count of detected call sites for the symbol.
     */
    callSites?: number
  }
}

/**
 * Represents the specific reason why a symbol or member cannot be documented.
 *
 * @returns Represents the specific reason why a symbol or member cannot be documented.
 */
export type NonDocumentableReason =
  'inline-object-member' | 'generated' | 'external' | 'non-documentable-member'

/**
 * Describes whether a target is documentable and the reason if it is not.
 *
 * @returns Describes whether a target is documentable and the reason if it is not.
 */
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
 *
 * @returns Represents an entry in the JSDoc update context, defining a target symbol and its associated metadata.
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
 *
 * @returns Represents the existing JSDoc documentation structure for a symbol.
 */
export interface ExistingJsDoc {
  /**
   * The JSDoc summary text, if present.
   *
   * @returns The JSDoc summary text, if present.
   */
  summary?: string

  /**
   * An array of parameter documentation entries.
   *
   * @returns An array of parameter documentation entries.
   */
  params: Array<{
    name: string
    sortOrder: number
    type?: string
    description?: string
  }>

  /**
   * The return value documentation, if present.
   *
   * @returns The return value documentation, if present.
   */
  returns?: string

  /**
   * An array of additional JSDoc tags.
   *
   * @returns An array of additional JSDoc tags.
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
 * Represents a node within a schema structure for analysis.
 *
 * @returns Represents a node within a schema structure for analysis.
 */
export interface SchemaStructureNode {
  /**
   * The name of the node in the schema structure.
   */
  name: string

  /**
   * The category or data type represented by this schema node.
   */
  kind: 'property' | 'object' | 'array' | 'union' | 'primitive' | 'reference' | 'literal'

  /**
   * An optional string representation of the underlying data type.
   */
  type?: string

  /**
   * An optional semantic descriptor providing context for the node's intent.
   */
  semanticHint?: string

  /**
   * Optional schema annotations containing additional metadata or validation rules.
   */
  annotations?: SchemaAnnotations | undefined

  /**
   * Nested child nodes that compose this schema structure.
   */
  children?: Array<SchemaStructureNode>
}

// /**
//  * Represents a section of code or documentation that should be protected from automatic modification.
//  */
// export interface ProtectedSection {
//   /**
//    * The type of section being protected.
//    */
//   kind: 'summary' | 'param' | 'returns' | 'tag'

//   /**
//    * Optional identifier for the section.
//    */
//   key?: string

//   /**
//    * The reason why the section is protected.
//    */
//   reason: 'preserve-marker' | 'human-edited' | 'custom-content'
// }
