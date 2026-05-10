import { Readable } from 'node:stream'
// import { fs } from '../../fs/index.js';

export const readableStream2ArrayBuffer = async (stream: ReadableStream) => {
  return await new Response(stream).arrayBuffer()
}
export const readableStream2Buffer = async (stream: ReadableStream) => {
  const arrayBuf = await readableStream2ArrayBuffer(stream)
  return Buffer.from(arrayBuf)
  // return await buffer(stream);
}

export type FileInput = string | Buffer | Readable
export function fileInputToReadable(
  input: string,
  createReadStream: (path: string) => Readable,
): Readable

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

export const readableToBuffer = async (input: Buffer | Readable): Promise<Buffer> => {
  if (Buffer.isBuffer(input)) return input

  const chunks: Array<Buffer> = []
  for await (const chunk of input) {
    chunks.push(Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}
