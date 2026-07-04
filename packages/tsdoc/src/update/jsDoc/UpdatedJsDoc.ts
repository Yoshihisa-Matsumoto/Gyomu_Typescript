import type { ParsedJsDoc } from '@gyomu/schema/schemas/typescript'

export type UpdatedJsDoc = Omit<ParsedJsDoc, 'raw'>
