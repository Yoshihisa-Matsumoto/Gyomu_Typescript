/**
 * Represents the supported string encodings for data operations.
 */
export type SupportEncoding = 'shiftjis' | 'utf8'

/**
 * Converts a plain string to a base64 encoded string.
 *
 * @param plainString The input string to be encoded.
 *
 * @returns The resulting base64 string.
 */
export const string2Base64String = (plainString: string): string => {
  return buffer2Base64String(Buffer.from(plainString))
}

/**
 * Converts a Buffer to a base64 encoded string.
 *
 * @param buffer The source Buffer to encode.
 *
 * @returns The resulting base64 string.
 */
export const buffer2Base64String = (buffer: Buffer): string => {
  return buffer.toString('base64')
}

/**
 * Decodes a base64 encoded string into a UTF-8 string.
 *
 * @param encodedString The base64 encoded string to decode.
 *
 * @returns The decoded string.
 */
export const base64String2String = (encodedString: string): string => {
  return base64String2Buffer(encodedString).toString()
}

/**
 * Converts a base64 encoded string into a Buffer.
 *
 * @param encodedString The base64 encoded string to convert.
 *
 * @returns A Buffer containing the decoded data.
 */
export const base64String2Buffer = (encodedString: string): Buffer => {
  return Buffer.from(encodedString, 'base64')
}

// export const base64String2ArrayBuffer = (
//   encodedString: string
// ): ArrayBuffer => {
//   return base64String2Buffer(encodedString).buffer;
// };
