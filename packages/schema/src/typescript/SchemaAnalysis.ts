/**
 * An array of string literals representing the schema types supported by the library.
 */
export const SupportedSchemaTypeArray = [
  'Struct',
  'Literal',
  'Array',
  'Union',
  'Primitive',
  'Reference',
] as const

/**
 * A union type containing all schema kinds supported by the library, derived from the SupportedSchemaTypeArray.
 */
export type SupportedSchemaKind = (typeof SupportedSchemaTypeArray)[number]

/**
 * Determines if the given string value is a supported schema kind, excluding references.
 *
 * @param value The string to check against supported schema kinds.
 *
 * @returns True if the string represents a supported schema kind (excluding references), false otherwise.
 */
export const isSupportedSchemaType = (
  value: string,
): value is Exclude<SupportedSchemaKind, 'Reference'> =>
  SupportedSchemaTypeArray.some((x) => x === value)
