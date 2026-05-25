import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { buildConfigPaths } from '../buildConfigPaths.js'

describe('buildConfigPaths', () => {
  const rootDirectory = '/config'

  it('returns only global path when query is empty', () => {
    const result = buildConfigPaths(rootDirectory, {})

    expect(result.size).toBe(1)

    expect(result.get('global')).toBe(join(rootDirectory, 'setting.json'))
  })

  it('includes user path when userId is specified', () => {
    const result = buildConfigPaths(rootDirectory, {
      userId: 'user-1',
    })

    expect(result.size).toBe(2)

    expect(result.get('global')).toBe(join(rootDirectory, 'setting.json'))

    expect(result.get('user')).toBe(join(rootDirectory, 'users', 'user-1', 'setting.json'))
  })

  it('includes scope path when scope is specified', () => {
    const result = buildConfigPaths(rootDirectory, {
      scope: 'admin',
    })

    expect(result.size).toBe(2)

    expect(result.get('global')).toBe(join(rootDirectory, 'setting.json'))

    expect(result.get('scope')).toBe(join(rootDirectory, 'scopes', 'admin.json'))
  })

  it('includes all paths when userId and scope are specified', () => {
    const result = buildConfigPaths(rootDirectory, {
      userId: 'user-1',
      scope: 'admin',
    })

    expect(result.size).toBe(4)

    expect(result.get('global')).toBe(join(rootDirectory, 'setting.json'))

    expect(result.get('user')).toBe(join(rootDirectory, 'users', 'user-1', 'setting.json'))

    expect(result.get('scope')).toBe(join(rootDirectory, 'scopes', 'admin.json'))

    expect(result.get('user-scope')).toBe(join(rootDirectory, 'users', 'user-1', 'admin.json'))
  })

  it('does not include user-scope when only userId exists', () => {
    const result = buildConfigPaths(rootDirectory, {
      userId: 'user-1',
    })

    expect(result.has('user-scope')).toBe(false)
  })

  it('does not include user-scope when only scope exists', () => {
    const result = buildConfigPaths(rootDirectory, {
      scope: 'admin',
    })

    expect(result.has('user-scope')).toBe(false)
  })
})
