import { Schema } from 'effect'
import { FunctionBodyElement } from './FunctionBodyElement.js'

/**
 * Analysis results describing the implementation and behavior of a function body. This schema contains structural and behavioral elements identified within the function body, including expressions, statements, and control flow.
 */
export const FunctionBodyAnalysis = Schema.Struct({
  elements: Schema.Array(FunctionBodyElement).annotate({
    title: 'Function Body Elements',
    description:
      'The structural and behavioral elements identified within the function body, including expressions, statements, and control flow.',
  }),
}).annotate({
  identifier: 'FunctionBodyAnalysis',
  title: 'Function Body Analysis',
  description:
    'Analysis results describing the implementation and behavior of a function body. This analysis focuses on the function implementation rather than its callable signature.',
})

/**
 * Inferred TypeScript type for FunctionBodyAnalysis.
 */
export type FunctionBodyAnalysis = Schema.Schema.Type<typeof FunctionBodyAnalysis>
