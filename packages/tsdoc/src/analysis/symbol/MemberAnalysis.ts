export type MemberAnalysis = MethodMemberAnalysis | PropertyMemberAnalysis

export interface MethodMemberAnalysis {
  kind: 'method'

  name: string

  parameters: Array<ParameterAnalysis>

  returnType?: TypeAnalysis
}

export interface PropertyMemberAnalysis {
  kind: 'property'

  name: string

  type?: TypeAnalysis

  readonly: boolean
}

export interface ParameterAnalysis {
  name: string

  required: boolean

  rest: boolean

  type?: TypeAnalysis

  description?: string
}

export interface TypeAnalysis {
  text: string
}
