import type { Expression } from 'ts-morph'

export const analyzeExpression = (declaration: Expression) => ({
  kind: undefined,
  isDefault: false,
})
