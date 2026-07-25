interface GuideNodeBase {
  description?: string | undefined
  optional?: boolean | undefined
  attributes: Record<string, any>
}

export interface GuideProperty {
  name: string
  node: GuideNode
}

interface GuideObjectNode extends GuideNodeBase {
  kind: 'object'

  properties: ReadonlyArray<GuideProperty>
}

interface GuideArrayNode extends GuideNodeBase {
  kind: 'array'

  elementType: GuideNode
}

export const schemaKindMap = {
  Any: 'any',
  BigInt: 'bigint',
  Boolean: 'boolean',
  Never: 'never',
  Null: 'null',
  Number: 'number',
  String: 'string',
  Undefined: 'undefined',
  Unknown: 'unknown',
  Void: 'void',
} as const

export interface GuidePrimitiveNode extends GuideNodeBase {
  kind:
    | 'any'
    | 'bigint'
    | 'boolean'
    | 'never'
    | 'null'
    | 'number'
    | 'string'
    | 'undefined'
    | 'unknown'
    | 'void'
}

interface GuideLiteralNode extends GuideNodeBase {
  kind: 'literal'

  value: unknown
}

interface GuideUnionNode extends GuideNodeBase {
  kind: 'union'

  types: Array<GuideNode>
}

interface GuideEnumNode extends GuideNodeBase {
  kind: 'enum'

  values: ReadonlyArray<unknown>
}

interface GuideRecursiveNode extends GuideNodeBase {
  kind: 'recursive'
}

export type GuideNode =
  | GuideObjectNode
  | GuideArrayNode
  | GuidePrimitiveNode
  | GuideLiteralNode
  | GuideUnionNode
  | GuideEnumNode
  | GuideRecursiveNode
