import { decode, encode } from 'html-entities'

/**
 * Encodes a string for safe inclusion in HTML content.
 *
 * @param text The string to encode.
 *
 * @returns The HTML-encoded string.
 */
export const htmlEncode = (text: string) => {
  return encode(text)
}

/**
 * Decodes an HTML-encoded string back to its original form.
 *
 * @param htmlText The HTML-encoded string to decode.
 *
 * @returns The decoded string.
 */
export const htmlDecode = (htmlText: string) => {
  return decode(htmlText)
}
