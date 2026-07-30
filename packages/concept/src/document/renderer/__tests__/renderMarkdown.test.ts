import { describe, expect, it } from 'vitest'
import { renderMarkdown } from '../renderMarkdown.js'
import type { Section } from '@gyomu/schema/schemas/document'

describe('renderMarkdown', () => {
  const context = {
    knowledge: { package: { displayName: 'TITLE' } },
  } as any
  it('renders paragraph, bullet list and code blockm table', () => {
    const sections: Array<Section> = [
      {
        id: 'overview',
        title: 'Overview',
        contents: [
          {
            type: 'paragraph',
            text: 'This package provides shared utilities.',
          },
          {
            type: 'bullet-list',
            items: ['Item1', 'Item2'],
          },
          {
            type: 'code',
            language: 'ts',
            title: 'Example',
            code: 'console.log("hello")',
          },
          {
            type: 'table',
            header: { cells: ['Header1', 'Header2'] },
            rows: [{ cells: ['R1C1', 'R1C2'] }, { cells: ['R2C1', 'R2C2'] }],
          },
        ],
      },
    ]

    const markdown = renderMarkdown({
      context,
      plan: { language: 'en', destination: sections, targets: [] },
      getTitle: () => 'TITLE',
      getSectionTitle: (language, section) => {
        return 'Overview'
      },
    })

    expect(markdown).toBe(`# TITLE

## Overview

This package provides shared utilities.

- Item1
- Item2

### Example

\`\`\`ts
console.log("hello")
\`\`\`

| Header1 | Header2 |
| ------- | ------- |
| R1C1 | R1C2 |
| R2C1 | R2C2 |`)
  })

  it('uses default section title when title is undefined', () => {
    const sections: Array<Section> = [
      {
        id: 'overview',
        contents: [],
      },
    ]

    const markdown = renderMarkdown({
      context,
      plan: { language: 'en', destination: sections, targets: [] },
      getTitle: () => 'TITLE',
      getSectionTitle: (language, section) => {
        return 'Overview'
      },
    })

    expect(markdown).toContain('## Overview')
  })

  it('renders multiple sections', () => {
    const sections: Array<Section> = [
      {
        id: 'overview',
        title: 'Overview',
        contents: [
          {
            type: 'paragraph',
            text: 'First section.',
          },
        ],
      },
      {
        id: 'development',
        title: 'Development',
        contents: [
          {
            type: 'paragraph',
            text: 'Second section.',
          },
        ],
      },
    ]

    const markdown = renderMarkdown({
      context,
      plan: { language: 'en', destination: sections, targets: [] },
      getTitle: () => 'TITLE',
      getSectionTitle: (language, section) => {
        return section.title ?? ''
      },
    })

    expect(markdown).toBe(`# TITLE

## Overview

First section.

## Development

Second section.`)
  })

  it('renders empty section', () => {
    const sections: Array<Section> = [
      {
        id: 'overview',
        title: 'Overview',
        contents: [],
      },
    ]

    const markdown = renderMarkdown({
      context,
      plan: { language: 'en', destination: sections, targets: [] },
      getTitle: () => 'TITLE',
      getSectionTitle: (language, section) => {
        return 'Overview'
      },
    })

    expect(markdown).toBe(`# TITLE

## Overview

`)
  })
  it('renders empty section with link', () => {
    const sections: Array<Section> = [
      {
        id: 'overview',
        title: 'Overview',
        contents: [],
      },
    ]

    const markdown = renderMarkdown({
      context,
      plan: { language: 'en', destination: sections, targets: [] },
      getTitle: () => 'TITLE',
      getSectionTitle: (language, section) => {
        return 'Overview'
      },
      getLanguageLink: (language, plan) => {
        if (language == 'en') return 'US English'
        else return '[JP 日本語](README.ja.md)'
      },
    })

    expect(markdown).toBe(`# TITLE

US English | [JP 日本語](README.ja.md)

## Overview

`)
  })
})
