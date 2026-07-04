import type { JsDocAnalysis } from '../schemas/typescript/jsdoc/JsDocAnalysis.js'
import type { TypeAnalysis } from './SymbolModel.js'
import type { SymbolId } from './types.js'
import type { SymbolIdentity } from '../schemas/typescript/SymbolIdentity.js'
import type { ParsedJsDoc } from '../schemas/typescript/jsdoc/ParsedJsDoc.js'

/**
 * Defines a union of member analysis types, categorized by whether they are documentable.
 */
export type MemberAnalysis = NonDocumentableMemberAnalysis | DocumentableMemberAnalysis

/**
 * Defines the set of member analyses that are not subject to documentation.
 */
export type NonDocumentableMemberAnalysis =
  NonDocumentableMethodMemberAnalysis | NonDocumentablePropertyMemberAnalysis

/**
 * Defines the set of member analyses that are documentable.
 */
export type DocumentableMemberAnalysis =
  DocumentableMethodMemberAnalysis | DocumentablePropertyMemberAnalysis

/**
 * Unique identifier for a class or object member.
 */
export interface MemberIdentity {
  /**
   * The identifier of the symbol that owns this member.
   */
  readonly ownerSymbolId: SymbolId

  /**
   * The path to the member within the owning symbol.
   */
  readonly memberPath: Readonly<MemberIdentityMemberPath>

  /**
   * The signature identifier, used to distinguish overloaded members.
   */
  readonly signatureId: string
}

/**
 * Represents a path of segments identifying a member.
 */
export type MemberIdentityMemberPath = Array<string | number>
interface BaseMemberAnalysis {
  /**
   * Stable identifier of the symbol.
   *
   * @remarks
   * This identifier must remain stable across repeated analyses of the same source code.
   * It is used as a correlation key for generated documentation, merge operations,
   * snapshots, and other analysis artifacts.
   *
   * Recommended format:
   *
   * ```text
   * <relative-file-path>::<qualified-symbol-name>
   * ```
   *
   * Example:
   *
   * ```text
   * src/user/UserService.ts::UserService.getUser
   * ```
   */
  id: SymbolId

  kind: string

  documentable: boolean

  ownerSymbolId: SymbolId

  identity: SymbolIdentity

  name: string

  static: boolean

  visibility: MemberAccessor

  declarationOrder: number
}

interface MethodMemberAnalysis extends BaseMemberAnalysis {
  kind: 'method'

  parameters: Array<MemberAnalysis>

  returnType: TypeAnalysis | undefined

  snippet: string
}

/**
 * Represents the analysis of a method member that is not documentable.
 */
export interface NonDocumentableMethodMemberAnalysis extends MethodMemberAnalysis {
  /**
   * Indicates that this member is not documentable.
   */
  documentable: false
}

/**
 * Represents the analysis of a class or object member that supports JSDoc, specifically for method members.
 */
export interface DocumentableMethodMemberAnalysis extends MethodMemberAnalysis {
  /**
   * Indicates that this member is documentable.
   */
  documentable: true

  /**
   * Contains the structured JSDoc analysis.
   */
  jsDoc: JsDocAnalysis | undefined

  /**
   * A collection of parsed JSDoc/TSDoc elements.
   */
  parsedJsDoc: Array<ParsedJsDoc> | undefined

  /**
   * The location information of the symbol within the source code.
   */
  location: {
    /**
     * The starting line number of the symbol.
     */
    startLine: number

    /**
     * The ending line number of the symbol.
     */
    endLine: number
  }

  /**
   * The character offset where the symbol starts.
   */
  startOffset: number
}

interface PropertyMemberAnalysis extends BaseMemberAnalysis {
  kind: 'property'

  type: TypeAnalysis | undefined
  source: PropertySource
  readonly: boolean
  optional: boolean
  /**
   * Whether the parameter is a rest parameter.
   */
  rest: boolean
}

type PropertySource = 'property-declaration' | 'constructor-parameter' | 'parameter-declaration'

/**
 * Represents the analysis of a property member that is not documentable.
 */
export interface NonDocumentablePropertyMemberAnalysis extends PropertyMemberAnalysis {
  /**
   * Indicates that this member is not documentable.
   */
  documentable: false
}

/**
 * Represents the analysis of a class or object member that supports JSDoc, specifically for property members.
 */
export interface DocumentablePropertyMemberAnalysis extends PropertyMemberAnalysis {
  /**
   * Indicates that this member is documentable.
   */
  documentable: true

  /**
   * Contains the structured JSDoc analysis.
   */
  jsDoc: JsDocAnalysis | undefined

  /**
   * A collection of parsed JSDoc/TSDoc elements.
   */
  parsedJsDoc: Array<ParsedJsDoc> | undefined

  /**
   * The location information of the symbol within the source code.
   */
  location: {
    /**
     * The starting line number of the symbol.
     */
    startLine: number

    /**
     * The ending line number of the symbol.
     */
    endLine: number
  }

  /**
   * The character offset where the symbol starts.
   */
  startOffset: number
}

/**
 * Defines the access levels available for members.
 */
export type MemberAccessor = 'private' | 'protected' | 'public'
