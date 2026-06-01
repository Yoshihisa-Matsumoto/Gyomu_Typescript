/**
 * Parse string.
 * @param text text input
 */
export function parse(text: string): string

/**
 * Parse buffer.
 * @param buffer buffer input
 */
export function parse(buffer: Buffer): Buffer

export function parse(value: string | Buffer) {
  return value
}
