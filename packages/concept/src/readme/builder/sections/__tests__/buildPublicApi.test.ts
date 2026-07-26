import { describe, expect, it } from 'vitest'
import { Effect } from 'effect'
import { buildPublicApi } from '../buildPublicApi.js'
import type { ReadmeBuildContext } from '@gyomu/schema/concept'

describe('buildPublicApi', () => {
  it('builds public api section', async () => {
    const context = {
      concept: {
        capabilities: [
          {
            name: 'UserService',
            description: 'Provides user management operations.',
          },
          {
            name: 'AuthService',
            description: 'Handles authentication.',
          },
        ],
      },
    } as any

    const result = await Effect.runPromise(buildPublicApi.build(context))

    expect(result).toEqual({
      id: 'public-api',
      title: undefined,
      contents: [
        {
          type: 'bullet-list',
          items: [
            'UserService - Provides user management operations.',
            'AuthService - Handles authentication.',
          ],
        },
      ],
    })
  })

  it('creates empty bullet list when no capabilities exist', async () => {
    const context = {
      concept: {
        capabilities: [],
      },
    } as any

    const result = await Effect.runPromise(buildPublicApi.build(context))

    expect(result).toEqual({
      id: 'public-api',
      title: undefined,
      contents: [
        {
          type: 'bullet-list',
          items: [],
        },
      ],
    })
  })

  it('is always enabled', () => {
    expect(buildPublicApi.enabled({} as ReadmeBuildContext)).toBe(true)
  })
})
