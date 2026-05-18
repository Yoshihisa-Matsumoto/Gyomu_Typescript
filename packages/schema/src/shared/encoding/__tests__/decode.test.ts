import { Readable } from 'node:stream'
import { describe, expect, it } from 'vitest'
import { createDecoder } from '../decode.js'

describe('createDecoder', () => {
  it('Shift_JIS をデコードできる', async () => {
    // 「こんにちは」を Shift_JIS バイト列で表現
    const shiftJisBytes = Buffer.from([0x82, 0xb1, 0x82, 0xf1, 0x82, 0xc9, 0x82, 0xbf, 0x82, 0xcd])

    const decoder = createDecoder('shift-jis')

    const chunks: Array<string> = []

    await new Promise<void>((resolve, reject) => {
      Readable.from([shiftJisBytes])
        .pipe(decoder)
        .on('data', (chunk) => {
          chunks.push(chunk.toString())
        })
        .on('end', () => resolve())
        .on('error', reject)
    })

    expect(chunks.join('')).toBe('こんにちは')
  })

  it('分割チャンクでも正しくデコードできる', async () => {
    // 「こんにちは」の Shift_JIS
    const chunks = [
      Buffer.from([0x82, 0xb1, 0x82]), // 「こ」 + 「ん」の途中
      Buffer.from([0xf1, 0x82, 0xc9]),
      Buffer.from([0x82, 0xbf, 0x82, 0xcd]),
    ]

    const decoder = createDecoder('shift-jis')

    const results: Array<string> = []

    await new Promise<void>((resolve, reject) => {
      Readable.from(chunks)
        .pipe(decoder)
        .on('data', (chunk) => {
          results.push(chunk.toString())
        })
        .on('end', () => resolve())
        .on('error', reject)
    })

    expect(results.join('')).toBe('こんにちは')
  })

  it('空入力でもエラーにならない', async () => {
    const decoder = createDecoder('shift-jis')

    const results: Array<string> = []

    await new Promise<void>((resolve, reject) => {
      Readable.from([])
        .pipe(decoder)
        .on('data', (chunk) => {
          results.push(chunk.toString())
        })
        .on('end', () => resolve())
        .on('error', reject)
    })

    expect(results.join('')).toBe('')
  })

  it('不正なバイト列でも fatal: false のため置換文字で継続する', async () => {
    const invalidBytes = Buffer.from([0x82])

    const decoder = createDecoder('shift-jis')

    const results: Array<string> = []

    await new Promise<void>((resolve, reject) => {
      Readable.from([invalidBytes])
        .pipe(decoder)
        .on('data', (chunk) => {
          results.push(chunk.toString())
        })
        .on('end', () => resolve())
        .on('error', reject)
    })

    expect(results.join('')).toContain('�')
  })
})
