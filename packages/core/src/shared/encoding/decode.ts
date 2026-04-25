import { Transform } from 'node:stream';
import { TextDecoder } from 'node:util';

export const decode = (
  content: Uint8Array,
  encoding: string = 'utf-8',
): string => {
  const decoder = new TextDecoder(encoding);
  return decoder.decode(content);
};

/**
 * Shift-JIS 用のデコードストリームを作成するファクトリ
 */
export function createDecoder(encoding: string) {
  const decoder = new TextDecoder(encoding, { fatal: false });

  return new Transform({
    transform(chunk, _encoding, callback) {
      try {
        // stream: true を渡すことで、分割されたチャンクを正しく保持しながらデコード
        const decoded = decoder.decode(chunk, { stream: true });
        this.push(decoded);
        callback();
      } catch (err) {
        callback(err as Error);
      }
    },
    flush(callback) {
      // 最後に残ったバッファを処理
      this.push(decoder.decode());
      callback();
    },
  });
}
