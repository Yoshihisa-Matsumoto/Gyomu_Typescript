import { Readable, Writable } from 'node:stream'
import { describe, expect, it, vi } from 'vitest'
import { Layer } from 'effect'
import { webDownload } from '../download.js'
import { MainLayer, PlatformLayer } from '../../layer.js'
import { makeRunner } from '../../runtime.js'
import { mockFetch } from './fetchMock.js'

global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  status: 200,
  body: Readable.toWeb(Readable.from([Buffer.from(JSON.stringify({ a: 1 }))])),
})

vi.mock('@/platform', () => ({
  platform: {
    existsSync: vi.fn(() => false),
    extname: vi.fn(() => '.txt'),
    ensureFileSync: vi.fn(),
    removeSync: vi.fn(),
    createWriteStream: vi.fn(() => {
      return new Writable({
        write(chunk, enc, cb) {
          cb()
        },
      })
    }),
  },
}))

const nodeTestLayer = Layer.mergeAll(PlatformLayer, MainLayer)
const runNodeWithEnvOrThrow = makeRunner(nodeTestLayer)

describe('webDownload', () => {
  it('should download file', async () => {
    mockFetch({ a: 1 })

    const result = await runNodeWithEnvOrThrow(webDownload('http://test', 'test.txt'))

    expect(result).toBe(true)
  })
})
