import { Readable } from 'node:stream'
// import { fs } from '../../fs/index.js';

/**
 * Converts a ReadableStream into an ArrayBuffer.
 *
 * @param stream The input stream to convert.
 *
 * @returns A promise that resolves to an ArrayBuffer.
 */
export const readableStream2ArrayBuffer = async (stream: ReadableStream) => {
  return await new Response(stream).arrayBuffer()
}

/**
 * Converts a ReadableStream into a Buffer.
 *
 * @param stream The input stream to convert.
 *
 * @returns A promise that resolves to a Buffer.
 */
export const readableStream2Buffer = async (stream: ReadableStream) => {
  const arrayBuf = await readableStream2ArrayBuffer(stream)
  return Buffer.from(arrayBuf)
  // return await buffer(stream);
}

/**
 * Defines a union type of supported input formats: file path string, buffer, or Readable stream.
 */
export type FileInput = string | Buffer | Readable

/**
 * Converts a file path string into a Readable stream using a provided factory function.
 *
 * @param input The path to the file.
 *
 * @param createReadStream A function that creates a Readable stream from a path.
 *
 * @returns A Readable stream created from the input path.
 */
export function fileInputToReadable(
  input: string,
  createReadStream: (path: string) => Readable,
): Readable

/**
 * Wraps a Buffer or Readable stream as a Readable stream.
 *
 * @param input The input data to wrap.
 *
 * @returns A Readable stream wrapping the input.
 */
export function fileInputToReadable(input: Buffer | Readable): Readable

export function fileInputToReadable(
  input: FileInput,
  createReadStream?: (path: string) => Readable,
): Readable {
  if (typeof input === 'string') {
    if (!createReadStream) {
      throw new Error('createReadStream required')
    }
    return createReadStream(input)
  }

  if (Buffer.isBuffer(input)) {
    return Readable.from(input)
  }

  return input
}

/**
 * Converts a Buffer or Readable stream into a single Buffer.
 *
 * @param input The input buffer or readable stream.
 *
 * @returns A promise that resolves to a Buffer containing all data.
 */
export const readableToBuffer = async (input: Buffer | Readable): Promise<Buffer> => {
  if (Buffer.isBuffer(input)) return input

  const chunks: Array<Buffer> = []
  for await (const chunk of input) {
    chunks.push(Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}
