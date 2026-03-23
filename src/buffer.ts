import { Readable } from 'stream';
import { platform } from './platform/index.js';
import { encode2ShiftJIS } from './encoding/encode.js';
//import { buffer } from 'stream/consumers';

export const stringToArrayBuffer = (source: string): ArrayBuffer => {
  const encoder = new TextEncoder();
  const uintArray = encoder.encode(source);
  return uintArray.buffer.slice(
    uintArray.byteOffset,
    uintArray.byteLength + uintArray.byteOffset,
  ) as ArrayBuffer;
};

export const arrayBufferToString = (source: ArrayBuffer): string => {
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(source);
};

export const bufferToArrayBuffer = (buffer: Buffer): ArrayBuffer => {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
  // const ab = new ArrayBuffer(buffer.length);
  // const view = new Uint8Array(ab);
  // for (let i = 0; i < buffer.length; i++) {
  //   view[i] = buffer[i];
  // }
  // return ab;
};

export const utf8String2ShiftJisBuffer = (source: string) => {
  return encode2ShiftJIS(source).buffer;
};

export const readableStream2ArrayBuffer = async (stream: ReadableStream) => {
  return await new Response(stream).arrayBuffer();
};
export const readableStream2Buffer = async (stream: ReadableStream) => {
  const arrayBuf = await readableStream2ArrayBuffer(stream);
  return Buffer.from(arrayBuf);
  //return await buffer(stream);
};

export type FileInput = string | Buffer | Readable;
export const toReadable = (input: FileInput): Readable => {
  if (typeof input === 'string') {
    return platform.createReadStream(input);
  }
  if (Buffer.isBuffer(input)) return Readable.from(input);

  return input;
};

export const toBuffer = async (input: Buffer | Readable): Promise<Buffer> => {
  if (Buffer.isBuffer(input)) return input;

  const chunks: Buffer[] = [];
  for await (const chunk of input) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};
