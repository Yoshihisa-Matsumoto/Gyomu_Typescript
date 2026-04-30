import { Layer } from 'effect';
import { MainLayer } from '../layer.js';
import { NodeFileSystem } from '@effect/platform-node';
import { makeRunner } from '../runtime.js';
import { fetchJpxHolidays } from '../holiday/jpxFetcher.js';
import { expect, test } from 'vitest';
import { initLoggerFromEnv } from '../logger/pinoLogger.js';
await initLoggerFromEnv();
test('JPX Fetcher Test', async () => {
  const TestLayer = Layer.mergeAll(MainLayer).pipe(
    Layer.provideMerge(NodeFileSystem.layer),
  );
  const testRunner = makeRunner(TestLayer);

  const holidays = await testRunner(fetchJpxHolidays());

  expect(holidays.length).toBeGreaterThan(10);

  for (const h of holidays) {
    expect(h.holiday).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(h.year.toString()).toBe(h.holiday.slice(0, 4));
  }

  expect(holidays).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        market: 'JP',
        holiday: expect.stringMatching(/^202\d-/),
      }),
    ]),
  );
});
