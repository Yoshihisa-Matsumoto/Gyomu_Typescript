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

export const Uint8ArraytoBuffer = (u8: Uint8Array): Buffer =>
  Buffer.from(u8.buffer, u8.byteOffset, u8.byteLength);
