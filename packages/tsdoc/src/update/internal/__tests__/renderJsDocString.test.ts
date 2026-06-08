import { describe, expect, it } from 'vitest'
import { computeLine, renderJsDocString } from '../renderJsDocString.js'

describe('renderJsDocString.ts', () => {
  describe('computeLine', () => {
    it('renders blank line', () => {
      expect(
        computeLine(
          {
            type: 'blank',
          },
          '',
        ),
      ).toBe(' *')
    })
    it('renders text line', () => {
      expect(
        computeLine(
          {
            type: 'text',
            text: 'Create user',
          },
          '',
        ),
      ).toBe(' * Create user')
    })
    it('renders tag line', () => {
      expect(
        computeLine(
          {
            type: 'tag',
            text: '@param id User ID',
          },
          '',
        ),
      ).toBe(' * @param id User ID')
    })
  })
  describe('renderJsDocString', () => {
    it('renders empty jsdoc', () => {
      expect(renderJsDocString([], false, '')).toBeUndefined()
    })
    it('renders jsdoc with text', () => {
      expect(
        renderJsDocString(
          [
            {
              type: 'text',
              text: 'Create user',
            },
          ],
          false,
          '',
        ),
      ).toBe(`/**
 * Create user
 */`)
    })
    it('renders blank line', () => {
      expect(
        renderJsDocString(
          [
            {
              type: 'text',
              text: 'Create user',
            },
            {
              type: 'blank',
            },
            {
              type: 'tag',
              text: '@returns User',
            },
          ],
          false,
          '',
        ),
      ).toBe(`/**
 * Create user
 *
 * @returns User
 */`)
    })
    it('renders complete jsdoc', () => {
      expect(
        renderJsDocString(
          [
            {
              type: 'text',
              text: 'Create user',
            },
            {
              type: 'blank',
            },
            {
              type: 'tag',
              text: '@param id User ID',
            },
            {
              type: 'blank',
            },
            {
              type: 'tag',
              text: '@returns User',
            },
          ],
          false,
          '',
        ),
      ).toBe(`/**
 * Create user
 *
 * @param id User ID
 *
 * @returns User
 */`)
    })
  })
})
