import { decode, encode } from 'html-entities'

export const htmlEncode = (text: string) => {
  return encode(text)
}

export const htmlDecode = (htmlText: string) => {
  return decode(htmlText)
}
