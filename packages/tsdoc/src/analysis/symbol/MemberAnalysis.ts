import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'
import type { JsDocAnalysis } from '../jsdoc/JsDocAnalysis.js'
import type { TypeAnalysis } from './SymbolModel.js'
import type { SymbolId } from '../types.js'

export type MemberAnalysis = NonDocumentableMemberAnalysis | DocumentableMemberAnalysis
export type NonDocumentableMemberAnalysis =
  | NonDocumentableMethodMemberAnalysis
  | NonDocumentablePropertyMemberAnalysis
export type DocumentableMemberAnalysis =
  | DocumentableMethodMemberAnalysis
  | DocumentablePropertyMemberAnalysis

export interface MemberIdentity {
  readonly ownerSymbolId: MemberIdentityOwnerSymbolId

  readonly memberPath: Readonly<MemberIdentityMemberPath>

  readonly signatureId: string
}

export type MemberIdentityOwnerSymbolId = string
export type MemberIdentityMemberPath = Array<string>
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

  ownerSymbolId: MemberIdentityOwnerSymbolId

  identity: SymbolIdentity

  name: string

  static: boolean

  visibility: MemberAccessor
}

interface MethodMemberAnalysis extends BaseMemberAnalysis {
  kind: 'method'

  parameters: Array<MemberAnalysis>

  returnType?: TypeAnalysis

  snippet: string
}

export interface NonDocumentableMethodMemberAnalysis extends MethodMemberAnalysis {
  documentable: false
}

export interface DocumentableMethodMemberAnalysis extends MethodMemberAnalysis {
  documentable: true
  jsDoc?: JsDocAnalysis
  /**
   * Source code location.
   */
  location: {
    /**
     * Starting line number.
     */
    startLine: number

    /**
     * Ending line number.
     */
    endLine: number
  }
  /**
   * Start offset of the symbol location
   */
  startOffset: number
}

interface PropertyMemberAnalysis extends BaseMemberAnalysis {
  kind: 'property'

  type?: TypeAnalysis
  source: PropertySource
  readonly: boolean
  optional: boolean
  /**
   * Whether the parameter is a rest parameter.
   */
  rest: boolean
}

type PropertySource = 'property-declaration' | 'constructor-parameter' | 'parameter-declaration'

export interface NonDocumentablePropertyMemberAnalysis extends PropertyMemberAnalysis {
  documentable: false
}
export interface DocumentablePropertyMemberAnalysis extends PropertyMemberAnalysis {
  documentable: true
  jsDoc?: JsDocAnalysis
  /**
   * Source code location.
   */
  location: {
    /**
     * Starting line number.
     */
    startLine: number

    /**
     * Ending line number.
     */
    endLine: number
  }
  /**
   * Start offset of the symbol location
   */
  startOffset: number
}

export type MemberAccessor = 'private' | 'protected' | 'public'
