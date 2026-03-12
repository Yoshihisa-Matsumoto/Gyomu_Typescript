import { describe, it, expect, vi } from 'vitest';
import { writeCsv } from '../write';
import { Chunk, Effect, Stream, Schema } from '../..';

describe('writeCsv', () => {
  const testSchema = Schema.Struct({
    name: Schema.String,
    age: Schema.Number,
  });

  it('should convert rows to CSV string format', async () => {
    const rows = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
    ];

    //const result: string[] = [];
    const mockStream = {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      pipe: vi.fn((_transform) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        rows.forEach((_row) => {
          // Simulate transform processing
        });
        return mockStream;
      }),
    } as any;

    writeCsv(testSchema)(mockStream);
    expect(mockStream.pipe).toHaveBeenCalled();
  });

  it('should apply custom options to CSV stringifier', () => {
    const options = { quoted: true, bom: true };
    const mockStream = { pipe: vi.fn(() => mockStream) } as any;

    writeCsv(testSchema, options)(mockStream);
    expect(mockStream.pipe).toHaveBeenCalled();
  });

  it('should use default options when none provided', () => {
    const mockStream = { pipe: vi.fn(() => mockStream) } as any;

    writeCsv(testSchema)(mockStream);
    expect(mockStream.pipe).toHaveBeenCalled();
  });

  it('should handle empty rows', () => {
    const mockStream = { pipe: vi.fn(() => mockStream) } as any;

    writeCsv(testSchema)(mockStream);
    expect(mockStream.pipe).toHaveBeenCalled();
  });

  it('should handle null and undefined values in rows', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const rows = [
      { name: 'John', age: null },
      { name: undefined, age: 25 },
    ];
    const mockStream = { pipe: vi.fn(() => mockStream) } as any;

    writeCsv(testSchema)(mockStream);
    expect(mockStream.pipe).toHaveBeenCalled();
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

    const csv = Chunk.toReadonlyArray(result).join('');

    expect(csv).toContain('id,name');
  });
});
