import type { ParameterAnalysis, TypeAnalysis } from './SymbolModel.js'

export type MemberAnalysis = MethodMemberAnalysis | PropertyMemberAnalysis

export interface MethodMemberAnalysis {
  kind: 'method'

  name: string

  parameters: Array<ParameterAnalysis>

  returnType?: TypeAnalysis
  static: boolean
  visibility: MemberAccessor
}

export interface PropertyMemberAnalysis {
  kind: 'property'

  name: string

  type?: TypeAnalysis

  readonly: boolean
  optional: boolean
  static: boolean
  visibility: MemberAccessor
}

export type MemberAccessor = 'private' | 'protected' | 'public'
