import type { JsDocAnalysis } from '../schemas/typescript/jsdoc/JsDocAnalysis.js'

import type { SymbolIdentity } from '../schemas/typescript/SymbolIdentity.js'
import type { ParsedJsDoc } from '../schemas/typescript/jsdoc/ParsedJsDoc.js'
import type { MemberAccessor } from '../schemas/typescript/MemberAccessor.js'
import type { PropertySource } from '../schemas/typescript/PropertySource.js'

import type { TypeAnalysis } from '../schemas/typescript/type/TypeAnalysis.js'
import type { SymbolId } from './types.js'
import type { LineRange } from '../schemas/typescript/LineRange.js'
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

type MemberKind = 'method' | 'property'

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

  kind: MemberKind

  ownerSymbolId: SymbolId

  identity: SymbolIdentity

  name: string

  static: boolean

  visibility: MemberAccessor

  declarationOrder: number
}

interface BaseMethodMemberAnalysis extends BaseMemberAnalysis {
  kind: 'method'

  parameters: ReadonlyArray<MemberAnalysis>

  returnType: TypeAnalysis | undefined

  snippet: string
}

type NonDocumentableMember = {
  /**
   * Indicates that this member is not documentable.
   */
  documentable: false
}

type DocumentableMember = {
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
  parsedJsDoc: ReadonlyArray<ParsedJsDoc> | undefined

  /**
   * The location information of the symbol within the source code.
   */
  location: LineRange

  /**
   * The character offset where the symbol starts.
   */
  startOffset: number
}
/**
 * Represents the analysis of a method member that is not documentable.
 */
export interface NonDocumentableMethodMemberAnalysis
  extends BaseMethodMemberAnalysis, NonDocumentableMember {}

/**
 * Represents the analysis of a class or object member that supports JSDoc, specifically for method members.
 */
export interface DocumentableMethodMemberAnalysis
  extends BaseMethodMemberAnalysis, DocumentableMember {}

interface BasePropertyMemberAnalysis extends BaseMemberAnalysis {
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

/**
 * Represents the analysis of a property member that is not documentable.
 */
export interface NonDocumentablePropertyMemberAnalysis
  extends BasePropertyMemberAnalysis, NonDocumentableMember {}

/**
 * Represents the analysis of a class or object member that supports JSDoc, specifically for property members.
 */
export interface DocumentablePropertyMemberAnalysis
  extends BasePropertyMemberAnalysis, DocumentableMember {}
