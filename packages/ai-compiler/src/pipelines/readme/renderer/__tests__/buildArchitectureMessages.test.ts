import { Effect } from 'effect'
import { expect, it } from 'vitest'
import { makeRunner } from '@gyomu/schema/effect'
import { PlatformLayer } from '@gyomu/infra'
import { buildArchitectureMessages } from '../buildArchitectureMessages.js'

it('buildArchitectureMessages', async () =>
  await makeRunner(PlatformLayer)(
    Effect.gen(function* () {
      const context = {
        analysis: {
          directories: [
            {
              path: 'sub',
              concept: {
                summary: 'sub-summary',
                responsibilities: ['res3', 'res4'],
                relationships: ['res5', 'res6'],
                importance: 'Core',
              },
              facts: {
                publicApiSymbolCount: 2,
                rootApiSymbolCount: 2,
              },
            },
          ],
        },
        concept: {
          summary: 'summary',
          responsibilities: ['res1', 'res2'],
        },
      } as any
      const messages = yield* buildArchitectureMessages(context)

      expect(messages[0]).toMatchObject({
        id: '1',
        role: 'system',
      })
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      expect(messages[0]!.content).toContain('"Architecture" section ')

      const user = messages[1]
      expect(user).toBeDefined()
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (user) {
        expect(user).toMatchObject({
          id: '2',
          role: 'user',
        })
        expect(user.content).toContain('res1')
        expect(user.content).toContain('sub-summary')
        expect(user.content).toContain('res5')
      }
    }),
  ))
