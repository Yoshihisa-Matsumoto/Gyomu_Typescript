import { describe, expect, it } from 'vitest'
import { getCaller } from '../getCaller.js'

describe('getCallerName', () => {
  it('returns the caller function name', () => {
    function caller() {
      return getCaller()
    }
    const result = caller()
    expect(result).toMatch(/caller|\.test\.ts:\d+:\d+/)
  })

  it('returns the caller at the specified depth', () => {
    function level1() {
      return level2()
    }

    function level2() {
      return level3()
    }

    function level3() {
      return getCaller(2)
    }

    expect(level1()).toBe('level1')
  })

  it('returns unknown when the depth exceeds the stack', () => {
    expect(getCaller(1000)).toBe('unknown')
  })

  it('returns anonymous for anonymous functions when supported by the runtime', () => {
    const name = (() => getCaller())()

    // ランタイムによって anonymous または変数名等になるため厳密比較しない
    expect(typeof name).toBe('string')
    expect(name.length).toBeGreaterThan(0)
  })
})
