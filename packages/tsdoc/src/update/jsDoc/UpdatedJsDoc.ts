import type { ParsedJsDoc } from '@gyomu/schema/typescript'

export type UpdatedJsDoc = Omit<ParsedJsDoc, 'raw'>
