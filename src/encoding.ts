export const decode = (
  content: ArrayBuffer | NodeJS.ArrayBufferView<ArrayBufferLike>,
  encoding: string = 'utf-8',
) => {
  const decoder = new TextDecoder(encoding);
  return decoder.decode(content);
};
