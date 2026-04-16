import { Readable } from 'stream';
import { platform } from '../../../platform/index.js';

export const readableStream2ArrayBuffer = async (stream: ReadableStream) => {
  return await new Response(stream).arrayBuffer();
};
export const readableStream2Buffer = async (stream: ReadableStream) => {
  const arrayBuf = await readableStream2ArrayBuffer(stream);
  return Buffer.from(arrayBuf);
  //return await buffer(stream);
};

export type FileInput = string | Buffer | Readable;
export const fileInputToReadable = (input: FileInput): Readable => {
  if (typeof input === 'string') {
    return platform.createReadStream(input);
  }
  if (Buffer.isBuffer(input)) return Readable.from(input);

  return input;
};

export const readableToBuffer = async (
  input: Buffer | Readable,
): Promise<Buffer> => {
  if (Buffer.isBuffer(input)) return input;

  const chunks: Buffer[] = [];
  for await (const chunk of input) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};
