export const SupportedSchemaTypeArray = [
  'Struct',
  'Literal',
  'Array',
  'Union',
  'Primitive',
  'Reference',
] as const
export type SupportedSchemaKind = (typeof SupportedSchemaTypeArray)[number]

export const isSupportedSchemaType = (
  value: string,
): value is Exclude<SupportedSchemaKind, 'Reference'> =>
  SupportedSchemaTypeArray.some((x) => x === value)
