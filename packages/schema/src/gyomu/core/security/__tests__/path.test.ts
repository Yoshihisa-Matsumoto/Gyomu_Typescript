import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { Effect, Result } from 'effect'

import { resolvePathWithinBase } from '../path.js'
import { GyomuError } from '../../../../error/GyomuError.js'

const run = <A, E>(eff: Effect.Effect<A, E, never>) => Effect.runSync(Effect.result(eff))

describe('resolvePathWithinBase', () => {
  const basePath = path.resolve('repo')

  describe('valid paths', () => {
    it('resolves simple relative path', () => {
      const result = run(resolvePathWithinBase(basePath, 'packages/app'))

      expect(Result.isSuccess(result)).toBe(true)
      if (Result.isSuccess(result)) {
        expect(result.success).toBe(path.join('packages', 'app'))
      }
    })

    it('resolves nested path correctly', () => {
      const result = run(resolvePathWithinBase(basePath, 'packages/infra/src'))

      expect(Result.isSuccess(result)).toBe(true)
      if (Result.isSuccess(result)) {
        expect(result.success).toBe(path.normalize('packages/infra/src'))
      }
    })

    it('handles "." correctly', () => {
      const result = run(resolvePathWithinBase(basePath, '.'))

      expect(Result.isSuccess(result)).toBe(true)
      if (Result.isSuccess(result)) {
        expect(result.success).toBe('.')
      }
    })
  })

  describe('security: path traversal', () => {
    it('blocks .. traversal escape', () => {
      const result = run(resolvePathWithinBase(basePath, '../etc'))

      expect(Result.isFailure(result)).toBe(true)
      if (Result.isFailure(result)) {
        expect(result.failure).toBeInstanceOf(GyomuError)
      }
    })

    it('blocks deep traversal escape', () => {
      const result = run(resolvePathWithinBase(basePath, '../../etc/passwd'))

      expect(Result.isFailure(result)).toBe(true)
    })

    it('blocks mixed traversal attack', () => {
      const result = run(resolvePathWithinBase(basePath, 'a/b/../../../etc'))

      expect(Result.isFailure(result)).toBe(true)
    })
  })

  describe('security: absolute path attacks', () => {
    it('blocks absolute path outside base', () => {
      const result = run(resolvePathWithinBase(basePath, '/etc/passwd'))

      expect(Result.isFailure(result)).toBe(true)
    })

    it('blocks windows-style absolute path', () => {
      const result = run(resolvePathWithinBase(basePath, 'C:/Windows/System32'))

      expect(Result.isFailure(result)).toBe(true)
    })
  })
})
