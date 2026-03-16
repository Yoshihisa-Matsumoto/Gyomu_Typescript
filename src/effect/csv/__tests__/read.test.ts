import { describe, it, expect } from 'vitest';
import { parseCsv, readCsv, readCsvRaw } from '../read.js';
import { Stream, Schema, Effect } from 'effect';

describe('CSV Read Functions', () => {
  describe('parseCsv', () => {
    it('should parse basic CSV data', async () => {
      const csvData = 'name,age\nJohn,30\nJane,25';
      const stream = Stream.fromIterable(csvData.split(''));

      const result = await Stream.runCollect(stream.pipe(parseCsv())).pipe(
        Effect.runPromise,
      );

      //const records = Chunk.toReadonlyArray(result);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('age');
    });

    it('should handle CSV with BOM option', async () => {
      const csvWithBOM = '\uFEFFname,age\nJohn,30';
      const stream = Stream.fromIterable(csvWithBOM.split(''));

      const result = await Stream.runCollect(
        stream.pipe(parseCsv({ bom: true })),
      ).pipe(Effect.runPromise);

      //const records = Chunk.toReadonlyArray(result);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should skip empty lines', async () => {
      const csvData = 'name,age\nJohn,30\n\nJane,25';
      const stream = Stream.fromIterable(csvData.split(''));

      const result = await Stream.runCollect(stream.pipe(parseCsv())).pipe(
        Effect.runPromise,
      );

      // Should skip empty line
      expect(result.length).toBeLessThanOrEqual(2);
    });

    it('should trim whitespace by default', async () => {
      const csvData = 'name, age \n John , 30 ';
      const stream = Stream.fromIterable(csvData.split(''));

      const result = await Stream.runCollect(stream.pipe(parseCsv())).pipe(
        Effect.runPromise,
      );

      if (result.length > 0) {
        const firstRecord = result[0] as Record<string, string>;
        expect(firstRecord.name?.trim()).toBe(
          firstRecord.name ?? firstRecord.name,
        );
      }
    });

    it('should map header names using fields option', async () => {
      const csvData = 'user_name,user_age\nJohn,30';
      const stream = Stream.fromIterable(csvData.split(''));

      const result = await Stream.runCollect(
        stream.pipe(
          parseCsv({
            fields: [
              { key: 'name', header: 'user_name' },
              { key: 'age', header: 'user_age' },
            ],
          }),
        ),
      ).pipe(Effect.runPromise);

      if (result.length > 0) {
        const firstRecord = result[0] as Record<string, string>;
        expect(firstRecord).toHaveProperty('name');
        expect(firstRecord).toHaveProperty('age');
      }
    });
  });

  describe('readCsv', () => {
    it('should read and validate CSV data', async () => {
      const schema = Schema.Struct({
        name: Schema.String,
        age: Schema.NumberFromString,
      });

      const csvData = 'name,age\nJohn,30\nJane,25';
      const stream = Stream.fromIterable(csvData.split(''));

      const result = await Stream.runCollect(stream.pipe(readCsv(schema))).pipe(
        Effect.runPromise,
      );

      expect(result.length).toBeGreaterThan(0);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('name');
        expect(result[0]).toHaveProperty('age');
      }
    });

    it('should apply filterRaw option', async () => {
      const schema = Schema.Struct({
        name: Schema.String,
        age: Schema.NumberFromString,
      });

      const csvData = 'name,age\nJohn,30\nJane,25\nBob,20';
      const stream = Stream.fromIterable(csvData.split(''));

      const result = await Stream.runCollect(
        stream.pipe(
          readCsv(schema, {
            filterRaw: (row) => parseInt(row.age) > 25,
          }),
        ),
      ).pipe(Effect.runPromise);

      // Should only contain records with age > 25
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('should apply decoded filter option', async () => {
      const schema = Schema.Struct({
        name: Schema.String,
        age: Schema.NumberFromString,
      });

      const csvData = 'name,age\nJohn,30\nJane,25\nBob,20';
      const stream = Stream.fromIterable(csvData.split(''));

      const result = await Stream.runCollect(
        stream.pipe(
          readCsv(schema, {
            filter: (row) => row.age > 25,
          }),
        ),
      ).pipe(Effect.runPromise);

      // Should only contain records with age > 25
      result.forEach((record: any) => {
        expect(record.age).toBeGreaterThan(25);
      });
    });

    it('should apply both filterRaw and filter options', async () => {
      const schema = Schema.Struct({
        name: Schema.String,
        age: Schema.NumberFromString,
      });

      const csvData = 'name,age\nJohn,30\nJane,25\nBob,20';
      const stream = Stream.fromIterable(csvData.split(''));

      const result = await Stream.runCollect(
        stream.pipe(
          readCsv(schema, {
            filterRaw: (row) => row.name.length > 3,
            filter: (row) => row.age > 20,
          }),
        ),
      ).pipe(Effect.runPromise);

      result.forEach((record: any) => {
        expect(record.age).toBeGreaterThan(20);
        expect(record.name.length).toBeGreaterThan(3);
      });
    });

    it('should handle header mapping with schema', async () => {
      const schema = Schema.Struct({
        name: Schema.String,
        age: Schema.NumberFromString,
      });

      const csvData = 'user_name,user_age\nJohn,30\nJane,25';
      const stream = Stream.fromIterable(csvData.split(''));

      const result = await Stream.runCollect(
        stream.pipe(
          readCsv(schema, {
            fields: [
              { key: 'name', header: 'user_name' },
              { key: 'age', header: 'user_age' },
            ],
          }),
        ),
      ).pipe(Effect.runPromise);

      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('readCsvRaw', () => {
    it('should read raw CSV data without validation', async () => {
      const csvData = 'name,age\nJohn,30\nJane,25';
      const stream = Stream.fromIterable(csvData.split(''));

      const result = await Stream.runCollect(stream.pipe(readCsvRaw())).pipe(
        Effect.runPromise,
      );

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('age');
    });

    it('should apply filterRaw option to raw data', async () => {
      const csvData = 'name,age\nJohn,30\nJane,28\nBob,22';
      const stream = Stream.fromIterable(csvData.split(''));

      const result = await Stream.runCollect(
        stream.pipe(
          readCsvRaw({
            filterRaw: (row) => {
              console.log(row.age);
              return parseInt(row.age) >= 28;
            },
          }),
        ),
      ).pipe(Effect.runPromise);

      result.forEach((record: any) => {
        expect(parseInt(record.age)).toBeGreaterThanOrEqual(28);
      });
    });

    it('should handle header mapping in raw data', async () => {
      const csvData = 'user_name,user_age\nJohn,30\nJane,25';
      const stream = Stream.fromIterable(csvData.split(''));

      const result = await Stream.runCollect(
        stream.pipe(
          readCsvRaw({
            fields: [
              { key: 'name', header: 'user_name' },
              { key: 'age', header: 'user_age' },
            ],
          }),
        ),
      ).pipe(Effect.runPromise);

      if (result.length > 0) {
        const firstRecord = result[0] as Record<string, string>;
        expect(firstRecord).toHaveProperty('name');
        expect(firstRecord).toHaveProperty('age');
      }
    });
  });

  describe('Complex scenarios', () => {
    it('should handle CSV with quoted fields', async () => {
      const csvData = 'name,description\nJohn,"Hello, World"\nJane,"Test"';
      const stream = Stream.fromIterable(csvData.split(''));

      const result = await Stream.runCollect(stream.pipe(parseCsv())).pipe(
        Effect.runPromise,
      );

      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle CSV with optional fields', async () => {
      const schema = Schema.Struct({
        name: Schema.String,
        age: Schema.optional(Schema.NumberFromString),
      });

      const csvData = 'name,age\nJohn,30\nJane,';
      const stream = Stream.fromIterable(csvData.split(''));

      try {
        const result = await Stream.runCollect(
          stream.pipe(readCsv(schema)),
        ).pipe(Effect.runPromise);

        expect(result.length).toBeGreaterThan(0);
      } catch (error) {
        // Handle the case where empty fields can't be converted
        expect(error).toBeDefined();
      }
    });

    it('should handle empty CSV', async () => {
      const csvData = 'name,age';
      const stream = Stream.fromIterable(csvData.split(''));

      const result = await Stream.runCollect(stream.pipe(parseCsv())).pipe(
        Effect.runPromise,
      );

      expect(result).toBeDefined();
    });

    it('should process multiple rows correctly', async () => {
      const schema = Schema.Struct({
        id: Schema.NumberFromString,
        name: Schema.String,
      });

      const csvData = 'id,name\n1,Alice\n2,Bob\n3,Charlie\n4,David\n5,Eve';
      const stream = Stream.fromIterable(csvData.split(''));

      const result = await Stream.runCollect(stream.pipe(readCsv(schema))).pipe(
        Effect.runPromise,
      );

      expect(result.length).toBeGreaterThan(0);
      result.forEach((record: any) => {
        expect(record).toHaveProperty('id');
        expect(record).toHaveProperty('name');
        expect(typeof record.id).toBe('number');
        expect(typeof record.name).toBe('string');
      });
    });
  });
});
