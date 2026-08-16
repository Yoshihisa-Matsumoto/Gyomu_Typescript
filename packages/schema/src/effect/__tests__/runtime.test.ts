import { describe, expect, it } from 'vitest'
import { Cause, Context, Effect, Layer, Result } from 'effect'

import { makeRunner, makeRunnerAsReturn } from '../runtime.js'

/**
 * Test service
 */
class TestService extends Context.Service<
  TestService,
  {
    readonly value: string
  }
>()('TestService') {}

const testLayer = Layer.succeed(TestService, {
  value: 'test-value',
})

/**
 * Base layer which does not provide TestService.
 */
const emptyLayer = Layer.empty
describe('makeRunnerAsReturn', () => {
  describe('success', () => {
    it('returns Success', async () => {
      const runner = makeRunnerAsReturn(emptyLayer)

      const result = await runner(Effect.succeed('success'))

      expect(Result.isSuccess(result)).toBe(true)

      if (Result.isSuccess(result)) {
        expect(result.success).toBe('success')
      }
    })
  })

  describe('Effect failure', () => {
    it('returns Failure when Effect.fail occurs', async () => {
      const runner = makeRunnerAsReturn(emptyLayer)

      const error = new Error('business error')

      const result = await runner(Effect.fail(error))

      expect(Result.isFailure(result)).toBe(true)

      if (Result.isFailure(result)) {
        expect(result.failure).toBe(error)
      }
    })
  })

  describe('Layer failure', () => {
    it('rejects when a required service is missing', async () => {
      const runner = makeRunnerAsReturn(emptyLayer)

      const effect = Effect.gen(function* () {
        const service = yield* TestService

        return service.value
      })

      const rejected = await runner(effect).catch((error) => error)
      // console.dir(rejected, { depth: null })
      expect(Cause.isCause(rejected)).toBeTruthy()
      if (Cause.isCause(rejected)) {
        const defect = Cause.findDie(rejected)
        // console.dir(defect, { depth: null })
        if (Result.isSuccess(defect)) {
          const die = defect.success.defect
          expect(die).toBeInstanceOf(Error)
          if (die instanceof Error) {
            expect(die.message).include('Service not found: TestService')
          }
        }
      }
    })
  })

  describe('overrideLayer', () => {
    it('succeeds when overrideLayer provides the required service', async () => {
      const runner = makeRunnerAsReturn(emptyLayer)

      const effect = Effect.gen(function* () {
        const service = yield* TestService

        return service.value
      })

      const result = await runner(effect, testLayer)

      expect(Result.isSuccess(result)).toBe(true)

      if (Result.isSuccess(result)) {
        expect(result.success).toBe('test-value')
      }
    })
  })
})
describe('makeRunner', () => {
  describe('Success', () => {
    it('returns the value when Effect succeeds', async () => {
      const runner = makeRunner(emptyLayer)

      const effect = Effect.succeed('success')

      const result = await runner(effect)

      expect(result).toBe('success')
    })
  })

  describe('Effect failure', () => {
    it('rejects with the error when Effect.fail occurs', async () => {
      const runner = makeRunner(emptyLayer)

      const error = new Error('expected error')

      const effect = Effect.fail(error)

      await expect(runner(effect)).rejects.toBe(error)
    })
  })

  describe('Runtime / Die failure', () => {
    it('logs and rejects when Effect.die occurs', async () => {
      const runner = makeRunner(emptyLayer)

      const defect = new Error('unexpected defect')

      const effect = Effect.die(defect)

      const rejected = await runner(effect).catch((error) => error)

      expect(Cause.isCause(rejected)).toBeTruthy()

      if (Cause.isCause(rejected)) {
        const die = Cause.findDie(rejected)

        expect(Result.isSuccess(die)).toBe(true)

        if (Result.isSuccess(die)) {
          expect(die.success.defect).toBe(defect)
        }
      }
    })
  })

  describe('Layer failure', () => {
    it('logs and rejects when a required service is missing', async () => {
      const runner = makeRunner(emptyLayer)

      const effect = Effect.gen(function* () {
        const service = yield* TestService

        return service.value
      })

      const rejected = await runner(effect).catch((error) => error)

      expect(Cause.isCause(rejected)).toBeTruthy()

      if (Cause.isCause(rejected)) {
        const die = Cause.findDie(rejected)

        expect(Result.isSuccess(die)).toBe(true)

        if (Result.isSuccess(die)) {
          const defect = die.success.defect

          expect(defect).toBeInstanceOf(Error)

          if (defect instanceof Error) {
            expect(defect.message).toContain('Service not found: TestService')
          }
        }
      }
    })
  })
})
