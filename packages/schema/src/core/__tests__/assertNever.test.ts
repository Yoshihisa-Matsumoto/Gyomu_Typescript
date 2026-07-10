import { describe, expect, it } from 'vitest'
import { assertNever } from '../assertNever.js'

describe('assertNever', () => {
  it('throws an error', () => {
    expect(() => assertNever('unexpected' as never)).toThrow('Unexpected : unexpected')
  })

  it('includes the value in the error message', () => {
    expect(() => assertNever(123 as never)).toThrow('Unexpected : 123')
  })

  it('throws Error', () => {
    expect(() => assertNever(null as never)).toThrow(Error)
  })
})
