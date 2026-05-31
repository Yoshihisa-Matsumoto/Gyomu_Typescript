// tests/infra/holiday/JPXHolidayFetcher.test.ts

import { describe, expect, it, vi } from 'vitest'
import { Effect } from 'effect'
import { HolidayFetcher } from '@gyomu/schema/gyomu/holiday'
import { JPXHolidayFetcherLayer } from '../JpxHolidayFetcher.js'

import { fetchJpxHolidays } from '../jpxFetcher.js'

// ★ モック
vi.mock('../jpxFetcher.js', () => ({
  fetchJpxHolidays: vi.fn(),
}))

describe('JPXHolidayFetcher', () => {
  it('should fetch holidays when market is JP', async () => {
    // arrange
    const mockData = [{ year: 2024, holiday: '2024-01-01' }]
    ;(fetchJpxHolidays as any).mockReturnValue(Effect.succeed(mockData))

    // act
    const program = Effect.gen(function* () {
      const fetcher = yield* HolidayFetcher
      return yield* fetcher.fetch('JP')
    })

    const result = await Effect.runPromise(program.pipe(Effect.provide(JPXHolidayFetcherLayer)))

    // assert
    expect(result).toEqual(mockData)
    expect(fetchJpxHolidays).toHaveBeenCalled()
  })

  it('should fail when market is not JP', async () => {
    // act
    const program = Effect.gen(function* () {
      const fetcher = yield* HolidayFetcher
      return yield* fetcher.fetch('US')
    })

    // assert
    await expect(
      Effect.runPromise(program.pipe(Effect.provide(JPXHolidayFetcherLayer))),
    ).rejects.toMatchObject({ _tag: '@gyomu/schema/GyomuError', message: 'Invalid market' })
  })

  it('should map error when fetch fails', async () => {
    // arrange
    ;(fetchJpxHolidays as any).mockReturnValue(Effect.fail(new Error('network error')))

    const program = Effect.gen(function* () {
      const fetcher = yield* HolidayFetcher
      return yield* fetcher.fetch('JP')
    })

    // assert
    await expect(
      Effect.runPromise(program.pipe(Effect.provide(JPXHolidayFetcherLayer))),
    ).rejects.toMatchObject({
      _tag: '@gyomu/schema/GyomuError',
      message: 'fetchHoliday failed',
    })
  })
})
