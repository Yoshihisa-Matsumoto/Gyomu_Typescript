import { describe, it, expect } from 'vitest';
import { readCsv, parseCsv } from '../read.js';
import { writeCsv } from '../write.js';
import { Stream, Schema, Effect, Chunk } from 'effect';
import { readFile } from 'node:fs/promises';
//import { FileService } from '../../resource/services/fileService';
//import { IOError, unknownError } from '../../../errors';
import { FileSystem } from '@effect/platform/FileSystem';
import { NodeFileSystem } from '@effect/platform-node';
import { IOError, unknownError } from '../../../errors.js';

describe('CSV Read/Write Integration', () => {
  it('should read CSV data and validate structure', async () => {
    const inputFile = 'tests/test.utf8.csv';

    // Read CSV file content
    const inputContent = await readFile(inputFile, 'utf-8');
    const inputStream = Stream.fromIterable(inputContent.split(''));

    // Parse CSV
    const rawRecords = await Stream.runCollect(
      inputStream.pipe(parseCsv()),
    ).pipe(Effect.runPromise);

    const records = Chunk.toReadonlyArray(rawRecords);

    // Validate that records were parsed
    expect(records.length).toBeGreaterThan(0);
    expect(records[0]).toHaveProperty('UserName');
  });

  it('should read CSV with schema validation', async () => {
    const inputFile = 'tests/test.utf8.csv';

    const schema = Schema.Struct({
      UserID: Schema.String,
      UserName: Schema.String,
      Age: Schema.optional(Schema.String),
      Department: Schema.optional(Schema.String),
      Salary: Schema.optional(Schema.String),
      JoinDate: Schema.optional(Schema.String),
    });

    const inputContent = await readFile(inputFile, 'utf-8');
    const inputStream = Stream.fromIterable(inputContent.split(''));

    const records = await Stream.runCollect(
      inputStream.pipe(readCsv(schema)),
    ).pipe(Effect.runPromise);

    const parsedRecords = Chunk.toReadonlyArray(records);

    expect(parsedRecords.length).toBeGreaterThan(0);
    expect(parsedRecords[0]).toHaveProperty('UserName');
    expect(parsedRecords[0]).toHaveProperty('UserID');
  });

  it('should filter CSV records during read', async () => {
    const inputFile = 'tests/test.utf8.csv';

    const schema = Schema.Struct({
      UserName: Schema.String,
      UserID: Schema.String,
      Age: Schema.optional(Schema.String),
      Department: Schema.optional(Schema.String),
      Salary: Schema.optional(Schema.String),
      JoinDate: Schema.optional(Schema.String),
    });

    const inputContent = await readFile(inputFile, 'utf-8');
    const inputStream = Stream.fromIterable(inputContent.split(''));

    const filteredRecords = await Stream.runCollect(
      inputStream.pipe(
        readCsv(schema, {
          filter: (record) => record.UserName !== '',
        }),
      ),
    ).pipe(Effect.runPromise);

    const records = Chunk.toReadonlyArray(filteredRecords);

    expect(records.length).toBeGreaterThan(0);
    (records as any[]).forEach((record) => {
      expect(record.UserName).toBeTruthy();
    });
  });

  it('should handle BOM in CSV input', async () => {
    const inputFile = 'tests/test.utf8.bom.csv';

    const schema = Schema.Struct({
      UserName: Schema.String,
      UserID: Schema.String,
      Age: Schema.optional(Schema.String),
      Department: Schema.optional(Schema.String),
      Salary: Schema.optional(Schema.String),
      JoinDate: Schema.optional(Schema.String),
    });

    const inputContent = await readFile(inputFile, 'utf-8');
    const inputStream = Stream.fromIterable(inputContent.split(''));

    const records = await Stream.runCollect(
      inputStream.pipe(
        readCsv(schema, {
          bom: true,
        }),
      ),
    ).pipe(Effect.runPromise);

    const parsedRecords = Chunk.toReadonlyArray(records);

    expect(parsedRecords.length).toBeGreaterThan(0);
    expect(parsedRecords[0]).toHaveProperty('UserName');
  });

  it('should read CSV and write CSV using writeCsv', async () => {
    const inputFile = 'tests/test.utf8.csv';
    const schema = Schema.Struct({
      UserID: Schema.String,
      UserName: Schema.String,
      Age: Schema.optional(Schema.String),
      Department: Schema.optional(Schema.String),
      Salary: Schema.optional(Schema.String),
      JoinDate: Schema.optional(Schema.String),
    });

    const inputContent = await readFile(inputFile, 'utf-8');
    const inputStream = Stream.fromIterable(inputContent.split(''));

    const parsedRecords = await Stream.runCollect(
      inputStream.pipe(readCsv(schema)),
    ).pipe(Effect.runPromise);

    const rows = Chunk.toReadonlyArray(parsedRecords);
    expect(rows.length).toBeGreaterThan(0);

    const outputRows = await Stream.runCollect(
      Stream.fromIterable(rows).pipe(writeCsv(schema)),
    ).pipe(Effect.runPromise);

    const outputCsv = Chunk.toReadonlyArray(outputRows).join('');
    expect(outputCsv).toContain('UserID');
    expect(outputCsv).toContain('UserName');
    expect(outputCsv).toContain('Age');
  });

  it('use Layer to read CSV file', async () => {
    const inputFile = 'tests/test.utf8.csv';

    const schema = Schema.Struct({
      UserID: Schema.String,
      UserName: Schema.String,
      Age: Schema.optional(Schema.String),
      Department: Schema.optional(Schema.String),
      Salary: Schema.optional(Schema.String),
      JoinDate: Schema.optional(Schema.String),
    });

    //const NodeFSLive = FileLive.pipe(Layer.provide(NodeFileSystem.layer));
    // ファイルを開いて CSV を Stream 経由で読み込む関数
    const program = (path: string) =>
      FileSystem.pipe(
        Effect.map((fileService) =>
          fileService.stream(path).pipe(
            Stream.mapError((err) => unknownError(IOError, err)),
            // 1. Uint8Array を utf-8 文字列にデコード
            //Stream.decodeText('utf-8'),
            // 2. 文字列になったストリームを CSV 解析に渡す
            readCsv(schema),
          ),
        ),
        Stream.unwrap,
        Stream.runCollect,
      );

    // 実行例
    const parsedRecords = await Effect.runPromise(
      program(inputFile).pipe(
        Effect.provide(NodeFileSystem.layer),
        Effect.scoped,
      ),
    );

    const records = Chunk.toReadonlyArray(parsedRecords);

    expect(records.length).toBeGreaterThan(0);
    expect(records[0]).toHaveProperty('UserName');
    expect(records[0]).toHaveProperty('UserID');
  });
});
