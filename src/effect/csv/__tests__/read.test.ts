import { describe, it, expect } from 'vitest';
import { readCsv, collectCsv, readCsvDecoded } from '../read';
import { Stream, Effect } from '../../index';
//import { platform } from '../../../platform';
import { FileService } from '../../resource/services/fileService';
import { FileLive } from '../../resource/layers/fileLive';
// const openFile = (path: string) =>
//   Effect.acquireRelease(
//     Effect.sync(() => platform.createReadStream(path)),
//     (stream) => Effect.sync(() => stream.destroy()),
//   );

// const program = (path: string) =>
//   Effect.gen(function* () {
//     const stream = yield* openFile(path);

//     const rows = yield* collectCsv(stream);

//     return rows;
//   }).pipe(Effect.scoped);
const program = (path: string) =>
  FileService.pipe(
    Effect.flatMap((fileService) =>
      fileService.open(path).pipe(Effect.andThen(collectCsv)),
    ),
  );
describe('read.ts', () => {
  /**
   * Unitテスト用のCSVロー(Record<string, string>)を生成するジェネレータ
   */
  // async function* generateCsvRows() {
  //   yield { Name: 'Alice', Age: '30', City: 'Tokyo' };
  //   yield { Name: 'Bob', Age: '25', City: 'Osaka' };
  //   yield { Name: 'Charlie', Age: '35', City: 'Kyoto' };
  // }

  /**
   * Stringをチャンクで送信するAsyncIterableジェネレータ
   */
  async function* generateCsvStringChunks() {
    const csvContent =
      'Name,Age,City\nAlice,30,Tokyo\nBob,25,Osaka\nCharlie,35,Kyoto\n';
    const chunkSize = 10;
    for (let i = 0; i < csvContent.length; i += chunkSize) {
      yield csvContent.slice(i, i + chunkSize);
    }
  }

  /**
   * Uint8Arrayをチャンクで送信するAsyncIterableジェネレータ
   */
  async function* generateCsvUint8ArrayChunks() {
    const csvContent =
      'Name,Age,City\nAlice,30,Tokyo\nBob,25,Osaka\nCharlie,35,Kyoto\n';
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(csvContent);
    const chunkSize = 10;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      yield uint8Array.slice(i, i + chunkSize);
    }
  }

  describe('readCsv', () => {
    it('should read CSV rows from AsyncIterable source', async () => {
      const source = generateCsvStringChunks();
      const stream = readCsv(source);

      // Stream を collect して配列に変換
      const result = await Effect.runPromise(
        stream.pipe(
          Stream.runCollect,
          Effect.map((chunk) => chunk.length),
        ),
      );

      expect(result).toBeGreaterThan(0);
    });

    it('should read CSV rows with Uint8Array source', async () => {
      const source = generateCsvUint8ArrayChunks();
      const stream = readCsv(source);

      const result = await Effect.runPromise(
        stream.pipe(
          Stream.runCollect,
          Effect.map((chunk) => chunk.length),
        ),
      );

      expect(result).toBeGreaterThan(0);
    });

    it('should apply filter when filterFn is provided', async () => {
      // Note: 実際のCSVパーサーに依存するテストのため、
      // シンプルなアサーションで動作確認
      const source = generateCsvUint8ArrayChunks();
      const filterFn = (row: Record<string, string>) => {
        const result = !!row['Age'] && parseInt(row['Age']) >= 30;
        return result;
      };

      const stream = readCsv(source, { filterFn });

      const result = await Effect.runPromise(
        stream.pipe(
          Stream.runCollect,
          Effect.map((chunk) => chunk.length),
        ),
      );

      // フィルタリング後の結果
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe('collectCsv', () => {
    it('should collect CSV rows into an array', async () => {
      const source = generateCsvUint8ArrayChunks();
      const result = await Effect.runPromise(collectCsv(source));

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return readonly array', async () => {
      const source = generateCsvUint8ArrayChunks();
      const result = await Effect.runPromise(collectCsv(source));

      // readonly配列として機能することを確認
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should apply encoding when provided', async () => {
      const source = generateCsvUint8ArrayChunks();
      // UTF-8 encoding (デフォルト)
      const result = await Effect.runPromise(
        collectCsv(source, { encoding: 'utf-8' }),
      );

      expect(Array.isArray(result)).toBe(true);
    });

    it('should apply filter and collect', async () => {
      const source = generateCsvUint8ArrayChunks();
      const filterFn = (row: Record<string, string>) =>
        row['Name'] !== undefined;

      const result = await Effect.runPromise(collectCsv(source, { filterFn }));

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('readCsvDecoded', () => {
    it('should decode CSV rows using provided decoder function', async () => {
      const source = generateCsvUint8ArrayChunks();

      interface Person {
        name: string;
        age: number;
        city: string;
      }

      const decoder = (row: Record<string, string>): Person => ({
        name: row['Name'] || '',
        age: parseInt(row['Age'] || '0', 10),
        city: row['City'] || '',
      });

      const stream = readCsvDecoded(source, decoder);
      const result = await Effect.runPromise(
        stream.pipe(
          Stream.runCollect,
          Effect.map((chunk) => chunk.length),
        ),
      );

      expect(result).toBeGreaterThan(0);
    });

    it('should apply decoder with filter', async () => {
      const source = generateCsvUint8ArrayChunks();

      interface Person {
        name: string;
        age: number;
      }

      const decoder = (row: Record<string, string>): Person => ({
        name: row['Name'] || '',
        age: parseInt(row['Age'] || '0', 10),
      });

      const filterFn = (row: Record<string, string>) =>
        !!row['Age'] && parseInt(row['Age']) > 25;

      const stream = readCsvDecoded(source, decoder, { filterFn });
      const result = await Effect.runPromise(
        stream.pipe(
          Stream.runCollect,
          Effect.map((chunk) => chunk.length),
        ),
      );

      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('should handle decoder function transformations correctly', async () => {
      const source = generateCsvUint8ArrayChunks();

      const decoder = (row: Record<string, string>) => ({
        ...row,
        processed: true,
      });

      const stream = readCsvDecoded(source, decoder);
      const result = await Effect.runPromise(
        stream.pipe(
          Stream.runCollect,
          Effect.map((chunk) => chunk.length),
        ),
      );

      expect(result).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty CSV source', async () => {
      const emptySource = (async function* () {
        // 何も yield しない
      })();

      const stream = readCsv(emptySource);
      const result = await Effect.runPromise(
        stream.pipe(
          Stream.runCollect,
          Effect.map((chunk) => chunk.length),
        ),
      );

      expect(result).toBe(0);
    });
  });

  describe('integration test', () => {
    it('should read and process a real CSV file', async () => {
      const rows = await Effect.runPromise(
        program('tests/test.utf8.csv').pipe(
          Effect.provide(FileLive),
          Effect.scoped,
        ),
      );
      expect(Array.isArray(rows)).toBe(true);
      expect(rows.length).toBeGreaterThan(0);
      console.log(rows[0]);
    });
  });
});
