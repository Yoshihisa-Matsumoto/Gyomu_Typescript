import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'

export interface UpdatedJsDoc {
  target: SymbolIdentity
  summary?: string

  params: Array<{
    name: string
    description?: string
    type?: string
  }>

  returns?: string

  tags: Array<{
    tag: string
    content: string
  }>
}
