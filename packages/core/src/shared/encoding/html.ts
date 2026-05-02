import { encode, decode } from 'html-entities';

export const htmlEncode = (text: string) => {
  return encode(text);
};

export const htmlDecode = (htmlText: string) => {
  return decode(htmlText);
};
