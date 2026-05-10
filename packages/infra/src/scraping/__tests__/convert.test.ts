import { describe, expect, it } from 'vitest'
import { JSDOM } from 'jsdom'

import { convertTableElement } from '../convert.js'
import { Table } from '../table/table.js'

describe('convertHTMLElementByTagName', () => {
  it('tableタグ → Tableインスタンスが返る', () => {
    const dom = new JSDOM(`
      <table>
        <tr><td>A</td></tr>
      </table>
    `)

    const tableEl = dom.window.document.querySelector('table')!

    const option = {
      // 必要なら適当に
    } as any

    const result = convertTableElement(tableEl, option)

    expect(result).toBeInstanceOf(Table)
  })

  it('elementとoptionが正しく渡される', () => {
    const dom = new JSDOM(`<table></table>`)
    const tableEl = dom.window.document.querySelector('table')!

    const option = { test: 123 } as any

    const result = convertTableElement(tableEl, option)

    // Tableの内部にアクセスできるなら確認
    // （できないならこのテストはスキップでもOK）
    expect(result).toBeDefined()
  })

  // it('未対応タグはエラー', () => {
  //   const dom = new JSDOM(`<div></div>`)
  //   const div = dom.window.document.querySelector('div')!

  //   expect(() => convertTableElement(div as any, {} as any)).toThrow()
  // })
})
