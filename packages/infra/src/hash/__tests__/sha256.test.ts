import { describe, expect, it } from 'vitest'
import { sha256, shortSha256 } from '../sha256'

describe('sha256', () => {
  it('creates sha256 hash from string', () => {
    const result = sha256('hello world')

    expect(result).toBe('b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9')
  })

  it('creates same hash from Uint8Array', () => {
    const text = 'hello world'

    const fromString = sha256(text)
    const fromBytes = sha256(new TextEncoder().encode(text))

    expect(fromBytes).toBe(fromString)
  })

  it('creates hash for empty string', () => {
    const result = sha256('')

    expect(result).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
  })
  it('creates short sha256 hash from string', () => {
    const result = shortSha256('hello world')

    expect(result).toBe('b94d27b9934d')
  })
})
