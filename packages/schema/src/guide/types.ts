interface GuideNodeBase {
  description?: string | undefined
  optional?: boolean | undefined
  attributes: Record<string, any>
}

/**
 * Represents a named node entry in a guide schema.
 */
export interface GuideProperty {
  /**
   * The identifier of the property.
   */
  name: string

  /**
   * The node structure associated with this property.
   */
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

/**
 * Maps schema-friendly type labels to their primitive string representations.
 */
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

/**
 * Represents a node in the guide schema corresponding to primitive types.
 */
export interface GuidePrimitiveNode extends GuideNodeBase {
  /**
   * The specific primitive kind represented by this node.
   */
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

/**
 * A union type representing all possible kinds of guide schema nodes.
 */
export type GuideNode =
  | GuideObjectNode
  | GuideArrayNode
  | GuidePrimitiveNode
  | GuideLiteralNode
  | GuideUnionNode
  | GuideEnumNode
  | GuideRecursiveNode
