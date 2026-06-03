import type { ParsedJsDoc } from '../../analysis/jsdoc/ParsedJsDoc.js'

export type UpdatedJsDoc = Omit<ParsedJsDoc, 'raw'>
