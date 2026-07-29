import { describe, expect, it } from 'vitest'
import { renderReadmeMarkdown } from '../renderReadmeMarkdown.js'
import type { Section } from '@gyomu/schema/schemas/document'

describe('renderReadmeMarkdown', () => {
  const context = {
    knowledge: { package: { displayName: 'TITLE' } },
  } as any
  it('renders paragraph, bullet list and code block', () => {
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
        ],
      },
    ]

    const markdown = renderReadmeMarkdown(context, {
      language: 'en',
      destination: sections,
      targets: [],
    })

    expect(markdown).toBe(`# TITLE

## Overview

This package provides shared utilities.

- Item1
- Item2

### Example

\`\`\`ts
console.log("hello")
\`\`\``)
  })

  it('uses default section title when title is undefined', () => {
    const sections: Array<Section> = [
      {
        id: 'overview',
        contents: [],
      },
    ]

    const markdown = renderReadmeMarkdown(context, {
      language: 'en',
      destination: sections,
      targets: [],
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

    const markdown = renderReadmeMarkdown(context, {
      language: 'en',
      destination: sections,
      targets: [],
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

    const markdown = renderReadmeMarkdown(context, {
      language: 'en',
      destination: sections,
      targets: [],
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

    const markdown = renderReadmeMarkdown(
      context,
      { language: 'en', destination: sections, targets: [] },
      true,
    )

    expect(markdown).toBe(`# TITLE

US English | [JP 日本語](README.ja.md)

## Overview

`)
  })
})
