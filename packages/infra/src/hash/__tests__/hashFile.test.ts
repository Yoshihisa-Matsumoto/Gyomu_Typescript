import { mkdtemp, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { describe, expect, it } from 'vitest'
import { Effect } from 'effect'
import { hashFile } from '../hashFile.js'
import { PlatformLayer } from '../../layer.js'

describe('hashFile', () => {
  it('hashes file content', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'hash-test-'))
    const filePath = join(dir, 'sample.txt')

    await writeFile(filePath, 'hello world')

    const result = await Effect.runPromise(hashFile(filePath).pipe(Effect.provide(PlatformLayer)))

    expect(result).toBe('b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9')
  })

  it('fails when file does not exist', async () => {
    const effect = hashFile('/not-found.txt').pipe(Effect.provide(PlatformLayer))

    await expect(Effect.runPromise(effect)).rejects.toThrow()
  })
})
