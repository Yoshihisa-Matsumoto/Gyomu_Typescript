import { describe, expect, it } from 'vitest'
import { Effect } from 'effect'
import { buildInstallation } from '../buildInstallation.js'
import type { ReadmeBuildContext } from '@gyomu/schema/concept'

describe('buildInstallation', () => {
  it('builds installation section', async () => {
    const context = {
      analysis: {
        package: {
          name: '@gyomu/core',
        },
      },
    } as any

    const result = await Effect.runPromise(buildInstallation.build(context))

    expect(result).toEqual({
      section: {
        id: 'installation',
        title: undefined,
        contents: [
          {
            type: 'paragraph',
            text: 'Install using pnpm.',
          },
          {
            type: 'code',
            language: 'bash',
            code: 'pnpm add @gyomu/core',
          },
        ],
      },
    })
  })

  it('uses package name in install command', async () => {
    const context = {
      analysis: {
        package: {
          name: 'my-package',
        },
      },
    } as any

    const result = await Effect.runPromise(buildInstallation.build(context))

    const codeBlock = result.section.contents.find((content) => content.type === 'code')

    expect(codeBlock).toEqual({
      type: 'code',
      language: 'bash',
      code: 'pnpm add my-package',
    })
  })

  it('is always enabled', () => {
    expect(buildInstallation.enabled({} as ReadmeBuildContext)).toBe(true)
  })
})
