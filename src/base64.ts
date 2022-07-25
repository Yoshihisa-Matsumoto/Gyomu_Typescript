import iconv from 'iconv-lite';

export type SupportEncoding = 'shiftjis' | 'utf8';

export const string2Base64String = (plainString: string): string => {
  return buffer2Base64String(Buffer.from(plainString));
};
export const buffer2Base64String = (buffer: Buffer): string => {
  return buffer.toString('base64');
};

export const base64String2String = (encodedString: string): string => {
  return base64String2Buffer(encodedString).toString();
};

export const base64String2Buffer = (encodedString: string): Buffer => {
  return Buffer.from(encodedString, 'base64');
};

// export const base64String2ArrayBuffer = (
//   encodedString: string
// ): ArrayBuffer => {
//   return base64String2Buffer(encodedString).buffer;
// };
