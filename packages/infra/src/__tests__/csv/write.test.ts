import { describe, it, expect } from 'vitest';
import { writeCsv } from '../../csv/write.js';
import { Effect, Stream, Schema } from 'effect';
import path from 'path';
import { EOL } from 'os';

describe('writeCsv', () => {
  const testSchema = Schema.Struct({
    name: Schema.optional(Schema.String),
    age: Schema.NullOr(Schema.Number),
  });

  it('should convert rows to CSV string format', async () => {
    const rows = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
    ];

    const testData = Stream.fromIterable(rows);
    const program = testData.pipe(writeCsv(testSchema), Stream.runCollect);

    // 実行して中身を確認
    const result = await Effect.runPromise(program);
    expect(result.join('')).toContain('John');
  });

  it('should apply custom options to CSV stringifier', async () => {
    const options = { quoted: true, bom: true };
    const input = Stream.make({ name: 'Alice', age: 30 }); // 1件だけの本物ストリーム

    // 実際に動かす設計図を作る
    const program = input.pipe(
      writeCsv(testSchema, options),
      Stream.runCollect,
    );

    // 実際に動かして結果を確認
    const result = await Effect.runPromise(program);
    const output = result.join('');

    // options.quoted が効いているか、文字列の中身で判定
    expect(output).toContain('"Alice"');
  });

  it('should use default options when none provided', async () => {
    const input = Stream.make({ name: 'Alice', age: 30 }); // 1件だけの本物ストリーム

    // 実際に動かす設計図を作る
    const program = input.pipe(writeCsv(testSchema), Stream.runCollect);

    // 実際に動かして結果を確認
    const result = await Effect.runPromise(program);
    const output = result.join('');

    // options.quoted が効いているか、文字列の中身で判定
    expect(output).toContain('Alice,30');
  });

  it('should handle empty rows', async () => {
    const input = Stream.make(); // 1件だけの本物ストリーム

    // 実際に動かす設計図を作る
    const program = input.pipe(writeCsv(testSchema), Stream.runCollect);

    // 実際に動かして結果を確認
    const result = await Effect.runPromise(program);
    const output = result.join('');
    expect(output).toBe('name,age' + EOL); // ヘッダーだけの出力
  });

  it('should handle null and undefined values in rows', async () => {
    const rows = [
      { name: 'John', age: null },
      { name: undefined, age: 25 },
    ];
    const testData = Stream.fromIterable(rows);
    const program = testData.pipe(writeCsv(testSchema), Stream.runCollect);

    // 実行して中身を確認
    const result = await Effect.runPromise(program);
    expect(result.join('')).toContain('John');
  });
  it('should write csv', async () => {
    const schema = Schema.Struct({
      id: Schema.Number,
      name: Schema.String,
    });

    const rows = Stream.fromIterable([
      { id: 1, name: 'taro' },
      { id: 2, name: 'jiro' },
    ]);

    const result = await Stream.runCollect(rows.pipe(writeCsv(schema))).pipe(
      Effect.runPromise,
    );

    const csv = result.join('');

    expect(csv).toContain('id,name');
  });
});
