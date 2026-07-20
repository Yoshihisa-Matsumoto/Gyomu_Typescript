/**
 * Parse string input into string output.
 */
export function parse(text: string): string

/**
 * Parse buffer input into buffer output.
 */
export function parse(buffer: Buffer): Buffer
export function parse(input: any) {
  return input
}
