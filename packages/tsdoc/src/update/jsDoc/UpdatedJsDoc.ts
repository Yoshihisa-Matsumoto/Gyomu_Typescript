import type { ParsedJsDoc } from '@gyomu/schema/schemas/typescript'

/**
 * Represents a parsed JSDoc structure with the 'raw' field removed.
 */
export type UpdatedJsDoc = Omit<ParsedJsDoc, 'raw'>
