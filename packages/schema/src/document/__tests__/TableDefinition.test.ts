import { describe, expect, it } from 'vitest'

import { validateTable } from '../TableDefinition.js'
import type { Table } from '../../schemas/document/content/Table.js'

describe('validateTable', () => {
  it('returns valid when table structure is preserved', () => {
    const source: Table = {
      type: 'table',
      header: {
        cells: ['Name', 'Age'],
      },
      rows: [
        {
          cells: ['Alice', '20'],
        },
      ],
    }

    const destination: Table = {
      type: 'table',
      header: {
        cells: ['名前', '年齢'],
      },
      rows: [
        {
          cells: ['Alice', '20'],
        },
      ],
    }

    expect(validateTable(source, destination)).toEqual({
      issues: [],
      isValid: true,
    })
  })

  it('stops validation when header column count changes', () => {
    const source: Table = {
      type: 'table',
      header: {
        cells: ['Name', 'Age'],
      },
      rows: [
        {
          cells: ['Alice', '20'],
        },
      ],
    }

    const destination: Table = {
      type: 'table',
      header: {
        cells: ['名前'],
      },
      rows: [],
    }

    const result = validateTable(source, destination)

    expect(result.isValid).toBe(false)
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0]).toMatchObject({
      code: 'TABLE_HEADER_CELL_COUNT_CHANGED',
      details: {
        sourceCount: '2',
        translatedCount: '1',
      },
    })
  })

  it('stops validation when row count changes', () => {
    const source: Table = {
      type: 'table',
      header: {
        cells: ['Name', 'Age'],
      },
      rows: [
        {
          cells: ['Alice', '20'],
        },
      ],
    }

    const destination: Table = {
      type: 'table',
      header: {
        cells: ['名前', '年齢'],
      },
      rows: [],
    }

    const result = validateTable(source, destination)

    expect(result.isValid).toBe(false)
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0]).toMatchObject({
      code: 'TABLE_ROWS_COUNT_CHANGED',
      details: {
        sourceCount: '1',
        translatedCount: '0',
      },
    })
  })

  it('returns issue when row cell count changes', () => {
    const source: Table = {
      type: 'table',
      header: {
        cells: ['Name', 'Age'],
      },
      rows: [
        {
          cells: ['Alice', '20'],
        },
      ],
    }

    const destination: Table = {
      type: 'table',
      header: {
        cells: ['名前', '年齢'],
      },
      rows: [
        {
          cells: ['Alice'],
        },
      ],
    }

    const result = validateTable(source, destination)

    expect(result.isValid).toBe(false)
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0]).toMatchObject({
      code: 'TABLE_ROW_CELL_COUNT_CHANGED',
      translationId: 0,
      details: {
        sourceCount: '2',
        translatedCount: '1',
      },
    })
  })

  it('returns issue when source row cell count does not match header column count', () => {
    const source: Table = {
      type: 'table',
      header: {
        cells: ['Name', 'Age'],
      },
      rows: [
        {
          cells: ['Alice'],
        },
      ],
    }

    const destination: Table = {
      type: 'table',
      header: {
        cells: ['名前', '年齢'],
      },
      rows: [
        {
          cells: ['Alice'],
        },
      ],
    }

    const result = validateTable(source, destination)

    expect(result.isValid).toBe(false)
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0]).toMatchObject({
      code: 'TABLE_ROW_CELL_COUNT_CHANGED',
      translationId: 0,
    })
  })

  it('returns multiple issues when multiple rows have different cell counts', () => {
    const source: Table = {
      type: 'table',
      header: {
        cells: ['Name', 'Age'],
      },
      rows: [
        {
          cells: ['Alice', '20'],
        },
        {
          cells: ['Bob', '30'],
        },
      ],
    }

    const destination: Table = {
      type: 'table',
      header: {
        cells: ['名前', '年齢'],
      },
      rows: [
        {
          cells: ['Alice'],
        },
        {
          cells: ['Bob'],
        },
      ],
    }

    const result = validateTable(source, destination)

    expect(result.isValid).toBe(false)
    expect(result.issues).toHaveLength(2)

    expect(result.issues).toEqual([
      expect.objectContaining({
        code: 'TABLE_ROW_CELL_COUNT_CHANGED',
        translationId: 0,
        details: {
          sourceCount: '2',
          translatedCount: '1',
        },
      }),
      expect.objectContaining({
        code: 'TABLE_ROW_CELL_COUNT_CHANGED',
        translationId: 1,
        details: {
          sourceCount: '2',
          translatedCount: '1',
        },
      }),
    ])
  })
})
