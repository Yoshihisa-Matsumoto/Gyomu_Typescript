import { describe, expect, it } from 'vitest'
import { Effect } from 'effect'
import { buildLicense } from '../buildLicense.js'
import type { ReadmeBuildContext } from '@gyomu/schema/concept'

describe('buildLicense', () => {
  it('builds license section', async () => {
    const context = {
      analysis: {
        package: {
          license: 'MIT',
        },
      },
    } as any

    const result = await Effect.runPromise(buildLicense.build(context))

    expect(result).toEqual({
      id: 'license',
      title: undefined,
      contents: [
        {
          type: 'paragraph',
          text: 'MIT',
        },
      ],
    })
  })

  it('uses package license value', async () => {
    const context = {
      analysis: {
        package: {
          license: 'Apache-2.0',
        },
      },
    } as any

    const result = await Effect.runPromise(buildLicense.build(context))

    expect(result.contents[0]).toEqual({
      type: 'paragraph',
      text: 'Apache-2.0',
    })
  })

  it('is always enabled', () => {
    expect(buildLicense.enabled({} as ReadmeBuildContext)).toBe(true)
  })
})
