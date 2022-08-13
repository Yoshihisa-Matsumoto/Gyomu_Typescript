export const stringToArrayBuffer = (source: string): ArrayBuffer => {
  const encoder = new TextEncoder();
  return encoder.encode(source).buffer;
};

export const arrayBufferToString = (source: ArrayBuffer): string => {
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(source);
};

export const bufferToArrayBuffer = (buffer: Buffer): ArrayBuffer => {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  );
  // const ab = new ArrayBuffer(buffer.length);
  // const view = new Uint8Array(ab);
  // for (let i = 0; i < buffer.length; i++) {
  //   view[i] = buffer[i];
  // }
  // return ab;
};
