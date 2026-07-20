// import { buffer } from 'stream/consumers';
/**
 * Converts a string to an ArrayBuffer using UTF-8 encoding.
 *
 * @param source The string to convert.
 *
 * @returns An ArrayBuffer containing the UTF-8 encoded bytes of the string.
 */
export const stringToArrayBuffer = (source: string): ArrayBuffer => {
  const encoder = new TextEncoder()
  const uintArray = encoder.encode(source)
  return uintArray.buffer.slice(uintArray.byteOffset, uintArray.byteLength + uintArray.byteOffset)
}

/**
 * Converts an ArrayBuffer to a string using UTF-8 decoding.
 *
 * @param source The ArrayBuffer to decode.
 *
 * @returns The decoded string.
 */
export const arrayBufferToString = (source: ArrayBuffer): string => {
  const decoder = new TextDecoder('utf-8')
  return decoder.decode(source)
}

/**
 * Converts a Buffer to an ArrayBuffer, preserving the buffer slice.
 *
 * @param buffer The input Buffer.
 *
 * @returns A new ArrayBuffer containing the buffer's data.
 */
export const bufferToArrayBuffer = (buffer: Buffer): ArrayBuffer => {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer
  // const ab = new ArrayBuffer(buffer.length);
  // const view = new Uint8Array(ab);
  // for (let i = 0; i < buffer.length; i++) {
  //   view[i] = buffer[i];
  // }
  // return ab;
}

/**
 * Converts a Uint8Array to a Node.js Buffer.
 *
 * @param u8 The Uint8Array to convert.
 *
 * @returns A Buffer view of the Uint8Array data.
 */
export const Uint8ArraytoBuffer = (u8: Uint8Array): Buffer =>
  Buffer.from(u8.buffer, u8.byteOffset, u8.byteLength)
