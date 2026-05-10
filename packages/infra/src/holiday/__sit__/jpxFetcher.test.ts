import { Layer } from 'effect'
import { NodeFileSystem } from '@effect/platform-node'
import { afterAll, expect, test } from 'vitest'
import { MainLayer } from '../../layer.js'
import { makeRunner } from '../../runtime.js'
import { fetchJpxHolidays } from '../jpxFetcher.js'

afterAll(() => {
  // @ts-ignore - Node.jsの内部APIを使用して、すべてのアクティブなハンドルをログに出力
  const handles = process._getActiveHandles?.() ?? []
  console.log('HANDLES:', handles)
})

test('JPX Fetcher Test', async () => {
  const TestLayer = Layer.mergeAll(MainLayer).pipe(Layer.provideMerge(NodeFileSystem.layer))
  const testRunner = makeRunner(TestLayer)

  const holidays = await testRunner(fetchJpxHolidays())

  expect(holidays.length).toBeGreaterThan(10)

  for (const h of holidays) {
    expect(h.holiday).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(h.year.toString()).toBe(h.holiday.slice(0, 4))
  }

  expect(holidays).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        market: 'JP',
        holiday: expect.stringMatching(/^202\d-/),
      }),
    ]),
  )
})
