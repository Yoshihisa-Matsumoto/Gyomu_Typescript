import { describe, expect, it } from 'vitest'
import { createPathMatcher } from '../PathMatcher.js'

describe('createPathMatcher', () => {
  describe('fileName matcher', () => {
    it('matches same file name', () => {
      const matcher = createPathMatcher('UpdateOptions.ts')

      expect(matcher.kind).toBe('fileName')
      expect(matcher.match('src/update/UpdateOptions.ts')).toBe(true)
    })

    it('does not match different file name', () => {
      const matcher = createPathMatcher('UpdateOptions.ts')

      expect(matcher.match('src/update/Other.ts')).toBe(false)
    })
  })

  describe('relativePath matcher', () => {
    it('matches relative path suffix', () => {
      const matcher = createPathMatcher('update/UpdateOptions.ts')

      expect(matcher.kind).toBe('relativePath')
      expect(matcher.match('packages/tsdoc/src/update/UpdateOptions.ts')).toBe(true)
    })

    it('does not match different relative path', () => {
      const matcher = createPathMatcher('update/UpdateOptions.ts')

      expect(matcher.match('packages/tsdoc/src/create/UpdateOptions.ts')).toBe(false)
    })
  })

  describe('directory matcher', () => {
    it('matches files under directory', () => {
      const matcher = createPathMatcher('update/**')

      expect(matcher.kind).toBe('directory')

      expect(matcher.match('update/UpdateOptions.ts')).toBe(true)

      expect(matcher.match('update/subdir/File.ts')).toBe(true)
    })

    it('matches directory itself', () => {
      const matcher = createPathMatcher('update/**')

      expect(matcher.match('update')).toBe(true)
    })

    it('does not match other directory', () => {
      const matcher = createPathMatcher('update/**')

      expect(matcher.match('create/File.ts')).toBe(false)
    })

    it('does not match sibling directory with same prefix', () => {
      const matcher = createPathMatcher('update/**')

      expect(matcher.match('update2/File.ts')).toBe(false)
    })
  })

  describe('path normalization', () => {
    it('normalizes backslashes in filter', () => {
      const matcher = createPathMatcher('update\\UpdateOptions.ts')

      expect(matcher.match('packages/tsdoc/src/update/UpdateOptions.ts')).toBe(true)
    })

    it('normalizes duplicate slashes in filter', () => {
      const matcher = createPathMatcher('update//UpdateOptions.ts')

      expect(matcher.match('packages/tsdoc/src/update/UpdateOptions.ts')).toBe(true)
    })

    it('normalizes leading ./ in filter', () => {
      const matcher = createPathMatcher('./update/UpdateOptions.ts')

      expect(matcher.match('packages/tsdoc/src/update/UpdateOptions.ts')).toBe(true)
    })

    it('matches windows path', () => {
      const matcher = createPathMatcher('update/**')

      expect(matcher.match('update\\subdir\\File.ts')).toBe(true)
    })
  })
  describe('path is null or empty', () => {
    it('match with undefined filter', () => {
      const matcher = createPathMatcher()
      expect(matcher.match('packages/tsdoc/src/update/UpdateOptions.ts')).toBeTruthy()
    })
    it('match with emptry string filter', () => {
      const matcher = createPathMatcher('')
      expect(matcher.match('packages/tsdoc/src/update/UpdateOptions.ts')).toBeTruthy()
    })
  })
})
