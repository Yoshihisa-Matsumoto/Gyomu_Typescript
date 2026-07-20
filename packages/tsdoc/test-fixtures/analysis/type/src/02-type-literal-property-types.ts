export type PropertyTypesType = {
  name: string

  age?: number

  readonly id: string

  metadata: Record<string, unknown>

  tags: Array<string>

  status: 'active' | 'inactive'
}
