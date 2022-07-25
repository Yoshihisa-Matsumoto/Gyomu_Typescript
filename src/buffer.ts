export const stringToBufferArray = (source: string): ArrayBuffer => {
  const encoder = new TextEncoder();
  return encoder.encode(source).buffer;
};

export const bufferToString = (source: ArrayBuffer): string => {
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(source);
};
