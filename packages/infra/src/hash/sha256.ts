import { createHash } from 'node:crypto'

/**
 * Calculates the SHA-256 hash of a string or byte array and returns it as a hexadecimal string.
 *
 * @param value The input value to be hashed.
 *
 * @returns The hexadecimal representation of the SHA-256 hash.
 */
export const sha256 = (value: string | Uint8Array): string => {
  return createHash('sha256').update(value).digest('hex')
}

/**
 * Calculates the SHA-256 hash of a string or byte array and returns the first 12 characters of the hexadecimal string.
 *
 * @param value The input value to be hashed.
 *
 * @returns A 12-character truncated hexadecimal SHA-256 hash.
 */
export const shortSha256 = (value: string | Uint8Array): string => {
  return sha256(value).slice(0, 12)
}
