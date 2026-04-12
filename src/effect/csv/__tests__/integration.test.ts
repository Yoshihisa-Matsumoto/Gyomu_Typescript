import { describe, it, expect } from 'vitest';
import { readCsv, parseCsv } from '../read.js';
import { writeCsv } from '../write.js';
import { Stream, Schema, Effect, Layer } from 'effect';
import { readFile } from 'node:fs/promises';
import { NodeFileSystem } from '@effect/platform-node';
import { IOError, unknownError } from '../../../errors.js';
import { platform } from '../../../platform/index.js';
import {
  fileStream,
  writeTextToFile,
} from '../../infrastructure/fs/fs-utils.js';
import { MainLayer, PlatformLayer } from '../../infrastructure/layer.js';
import { makeRunner } from '../../infrastructure/runtime.js';

const nodeTestLayer = Layer.mergeAll(PlatformLayer, MainLayer);
const runNodeWithEnvOrThrow = makeRunner(nodeTestLayer);

describe('CSV Read/Write Integration', () => {
  it('should read CSV data and validate structure', async () => {
    const inputFile = 'tests/test.utf8.csv';

    // // Read CSV file content
    // const inputContent = await readFile(inputFile, 'utf-8');
    // const inputStream = Stream.fromIterable(inputContent.split(''));

    // Parse CSV
    const rawRecords = await runNodeWithEnvOrThrow(
      Stream.runCollect(fileStream(inputFile).pipe(parseCsv())),
    );

    // Validate that records were parsed
    expect(rawRecords.length).toBeGreaterThan(0);
    expect(rawRecords[0]).toHaveProperty('UserName');
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

    expect(records.length).toBeGreaterThan(0);
    expect(records[0]).toHaveProperty('UserName');
    expect(records[0]).toHaveProperty('UserID');
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

    expect(filteredRecords.length).toBeGreaterThan(0);
    filteredRecords.forEach((record) => {
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

    expect(records.length).toBeGreaterThan(0);
    expect(records[0]).toHaveProperty('UserName');
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

    expect(parsedRecords.length).toBeGreaterThan(0);

    const outputRows = await Stream.runCollect(
      Stream.fromIterable(parsedRecords).pipe(writeCsv(schema)),
    ).pipe(Effect.runPromise);

    const outputCsv = outputRows.join('');
    expect(outputCsv).toContain('UserID');
    expect(outputCsv).toContain('UserName');
    expect(outputCsv).toContain('Age');

    const program = (path: string) =>
      Effect.gen(function* () {
        return yield* Stream.fromIterable(parsedRecords).pipe(
          writeCsv(schema),
          writeTextToFile(path),
        );
      });

    await Effect.runPromise(
      program(platform.join(platform.tmpdir(), 'output-temp.csv')).pipe(
        Effect.provide(NodeFileSystem.layer),
        Effect.scoped,
      ),
    );
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
    // const program = (path: string) =>
    //   Effect.map(FileSystem.asEffect(), (fileService) =>
    //     fileService.stream(path).pipe(
    //       Stream.mapError((err) => unknownError(IOError, err)),
    //       readCsv(schema),
    //     ),
    //   ).pipe(Stream.unwrap, Stream.runCollect);
    const program = (path: string) =>
      Effect.gen(function* () {
        return yield* fileStream(path).pipe(
          Stream.mapError((err) => unknownError(IOError, err)),
          readCsv(schema),
          Stream.runCollect,
        );
      });

    // 実行例
    const parsedRecords = await Effect.runPromise(
      program(inputFile).pipe(
        Effect.provide(NodeFileSystem.layer),
        Effect.scoped,
      ),
    );

    expect(parsedRecords.length).toBeGreaterThan(0);
    expect(parsedRecords[0]).toHaveProperty('UserName');
    expect(parsedRecords[0]).toHaveProperty('UserID');
  });
});
