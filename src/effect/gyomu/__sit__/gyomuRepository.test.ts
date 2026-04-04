import { describe, it, expect, beforeEach } from 'vitest';
import { Effect, Layer } from 'effect';
import { GyomuRepository } from '../gyomuRepository.js';
import { MainLayer } from '../../infrastructure/layer.js';
import { ConfigLayer } from '../../infrastructure/config.js';
import { KyselyService } from '../../infrastructure/db/kysely-service.js';
import { NodeFileSystem } from '@effect/platform-node';
import { makeRunner } from '../../infrastructure/runtime.js';

const TestLayer = Layer.mergeAll(MainLayer, ConfigLayer, GyomuRepository.live)
  .pipe(Layer.provideMerge(KyselyService.live))
  .pipe(Layer.provideMerge(NodeFileSystem.layer));
const testRunner = makeRunner(TestLayer);

const testId = 'F6AE5F2D-BD14-4C5F-9CC3-3A69EF90DD5B';
describe('statusHandler Repository (Integration)', () => {
  beforeEach(async () => {
    const program = Effect.gen(function* () {
      const repo = yield* GyomuRepository;
      const statusHandler = repo.statusHandler;

      const filtered = yield* statusHandler.findByApplicationId(testId);

      yield* statusHandler.deleteRecords(filtered.map((f) => f.id));

      console.log('Deleted before test');
    });
    await testRunner(program, TestLayer);
  });

  it('CRUD + find methods should work correctly', async () => {
    const program = Effect.gen(function* () {
      const repo = yield* GyomuRepository;
      const statusHandler = repo.statusHandler;

      // --- CREATE ---
      const created = yield* statusHandler.create([
        {
          applicationId: testId,
          statusTypeId: testId,
          recipientAddress: null,
          recipientType: null,
          region: null,
        },
      ]);

      expect(created.length).toBe(1);
      expect(created[0].applicationId).toBe(testId);

      const createdId = created[0].id;
      // --- FIND BY ID ---
      const found = yield* statusHandler.findById(createdId);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(createdId);

      // --- UPDATE ---
      const updated = yield* statusHandler.updateRecords([
        { id: createdId, region: 'JPN' },
      ]);

      expect(updated[0].region).toBe('JPN');

      // --- FIND ALL ---
      const all = yield* statusHandler.findAll();
      expect(all.length).toBeGreaterThan(0);

      // --- FIND BY COLUMN ---
      const filtered = yield* statusHandler.findByApplicationId(testId);
      expect(filtered.length).toBeGreaterThan(0);
      console.log(filtered[0].id);
      console.log(createdId);
      expect(filtered.every((r) => r.id == createdId)).toBe(true);

      // --- DELETE ---
      yield* statusHandler.deleteRecords([createdId]);

      const afterDelete = yield* statusHandler.findById(createdId);
      expect(afterDelete).toBeUndefined();
      console.log('AllDone');
      return true;
    });

    const result = await testRunner(program, TestLayer);

    expect(result).toBe(true);
  });
});
