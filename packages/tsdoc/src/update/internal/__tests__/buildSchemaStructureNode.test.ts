import { describe, expect, it } from 'vitest'
import { buildSchemaStructureNode } from '../buildSchemaStructureNode.js'
import type { TypeStructureAnalysis } from '@gyomu/schema/schemas/typescript'

describe('buildSchemaStructureNode', () => {
  it('returns undefined for unsupported structure kinds', () => {
    const member = {
      kind: 'this',
    } as TypeStructureAnalysis

    expect(buildSchemaStructureNode(member, 'value')).toBeUndefined()
  })

  describe('object', () => {
    it('builds an object node with effect-schema properties', () => {
      const member = {
        kind: 'object',
        properties: [
          {
            name: 'id',
            type: {
              source: 'effect-schema',
              structure: {
                kind: 'primitive',
                elementType: 'string',
              },
            },
          },
          {
            name: 'name',
            type: {
              source: 'effect-schema',
              structure: {
                kind: 'reference',
                targetId: 'UserName',
              },
            },
          },
        ],
        annotations: {
          description: 'User object',
        },
      } as any as TypeStructureAnalysis

      expect(buildSchemaStructureNode(member, 'User')).toEqual({
        name: 'User',
        kind: 'object',
        children: [
          {
            name: 'id',
            kind: 'primitive',
            type: 'string',
            annotations: undefined,
          },
          {
            name: 'name',
            kind: 'reference',
            type: 'UserName',
            annotations: undefined,
          },
        ],
        annotations: {
          description: 'User object',
        },
      })
    })

    it('returns an empty children array when all properties are not effect-schema types', () => {
      const member = {
        kind: 'object',
        properties: [
          {
            name: 'id',
            type: {
              source: 'typescript',
              structure: {
                kind: 'primitive',
                elementType: 'string',
              },
            },
          },
        ],
      } as any as TypeStructureAnalysis

      expect(buildSchemaStructureNode(member, 'User')).toEqual({
        name: 'User',
        kind: 'object',
        children: [],
        annotations: undefined,
      })
    })

    it('returns undefined when an object has no properties', () => {
      const member = {
        kind: 'object',
      } as TypeStructureAnalysis

      expect(buildSchemaStructureNode(member, 'User')).toBeUndefined()
    })

    it('recursively builds nested object properties', () => {
      const member = {
        kind: 'object',
        properties: [
          {
            name: 'profile',
            type: {
              source: 'effect-schema',
              structure: {
                kind: 'object',
                properties: [
                  {
                    name: 'name',
                    type: {
                      source: 'effect-schema',
                      structure: {
                        kind: 'primitive',
                        elementType: 'string',
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      } as any as TypeStructureAnalysis

      expect(buildSchemaStructureNode(member, 'User')).toEqual({
        name: 'User',
        kind: 'object',
        children: [
          {
            name: 'profile',
            kind: 'object',
            children: [
              {
                name: 'name',
                kind: 'primitive',
                type: 'string',
                annotations: undefined,
              },
            ],
            annotations: undefined,
          },
        ],
        annotations: undefined,
      })
    })
  })

  describe('array', () => {
    it('builds an array node when the element type is a reference', () => {
      const member = {
        kind: 'array',
        elementType: {
          text: 'User',
          structure: {
            kind: 'reference',
            targetId: 'User',
          },
        },
        annotations: {
          description: 'Users',
        },
      } as any as TypeStructureAnalysis

      expect(buildSchemaStructureNode(member, 'users')).toEqual({
        name: 'users',
        kind: 'array',
        children: [
          {
            name: 'User',
            kind: 'reference',
            type: 'User',
          },
        ],
        annotations: {
          description: 'Users',
        },
      })
    })

    it('returns undefined when the array element is not a reference', () => {
      const member = {
        kind: 'array',
        elementType: {
          text: 'string',
          structure: {
            kind: 'primitive',
            elementType: 'string',
          },
        },
      } as any as TypeStructureAnalysis

      expect(buildSchemaStructureNode(member, 'values')).toBeUndefined()
    })

    it('returns undefined when the array element has no structure', () => {
      const member = {
        kind: 'array',
        elementType: {
          text: 'unknown',
        },
      } as any as TypeStructureAnalysis

      expect(buildSchemaStructureNode(member, 'values')).toBeUndefined()
    })

    it('preserves array annotations', () => {
      const member = {
        kind: 'array',
        elementType: {
          text: 'User',
          structure: {
            kind: 'reference',
            targetId: 'User',
          },
        },
        annotations: {
          description: 'A list of users',
        },
      } as any as TypeStructureAnalysis

      expect(buildSchemaStructureNode(member, 'users')?.annotations).toEqual({
        description: 'A list of users',
      })
    })
  })

  describe('literal', () => {
    it('builds a literal node from elementValue', () => {
      const member = {
        kind: 'literal',
        elementValue: 'active',
      } as any as TypeStructureAnalysis

      expect(buildSchemaStructureNode(member, 'status')).toEqual({
        name: 'status',
        kind: 'literal',
        type: 'active',
        annotations: undefined,
      })
    })

    it('uses an empty string when elementValue is undefined', () => {
      const member = {
        kind: 'literal',
      } as TypeStructureAnalysis

      expect(buildSchemaStructureNode(member, 'status')).toEqual({
        name: 'status',
        kind: 'literal',
        type: '',
        annotations: undefined,
      })
    })

    it('converts non-string literal values to strings', () => {
      const member = {
        kind: 'literal',
        elementValue: 42,
      } as any as TypeStructureAnalysis

      expect(buildSchemaStructureNode(member, 'value')).toEqual({
        name: 'value',
        kind: 'literal',
        type: '42',
        annotations: undefined,
      })
    })
  })

  describe('primitive', () => {
    it('builds a primitive node', () => {
      const member = {
        kind: 'primitive',
        elementType: 'string',
        annotations: {
          description: 'User name',
        },
      } as any as TypeStructureAnalysis

      expect(buildSchemaStructureNode(member, 'name')).toEqual({
        name: 'name',
        kind: 'primitive',
        type: 'string',
        annotations: {
          description: 'User name',
        },
      })
    })
  })

  describe('reference', () => {
    it('builds a reference node', () => {
      const member = {
        kind: 'reference',
        targetId: 'UserId',
        annotations: {
          description: 'User identifier',
        },
      } as any as TypeStructureAnalysis

      expect(buildSchemaStructureNode(member, 'id')).toEqual({
        name: 'id',
        kind: 'reference',
        type: 'UserId',
        annotations: {
          description: 'User identifier',
        },
      })
    })
  })

  describe('union', () => {
    it('builds children only from effect-schema types', () => {
      const member = {
        kind: 'union',
        types: [
          {
            source: 'effect-schema',
            text: 'Active',
            structure: {
              kind: 'literal',
              elementValue: 'active',
            },
          },
          {
            source: 'typescript',
            text: 'Inactive',
            structure: {
              kind: 'literal',
              elementValue: 'inactive',
            },
          },
          {
            source: 'effect-schema',
            text: 'Pending',
            structure: {
              kind: 'literal',
              elementValue: 'pending',
            },
          },
        ],
        annotations: {
          description: 'Status',
        },
      } as any as TypeStructureAnalysis

      expect(buildSchemaStructureNode(member, 'status')).toEqual({
        name: 'status',
        kind: 'union',
        children: [
          {
            name: 'Active',
            kind: 'literal',
            type: 'active',
            annotations: undefined,
          },
          {
            name: 'Pending',
            kind: 'literal',
            type: 'pending',
            annotations: undefined,
          },
        ],
        annotations: {
          description: 'Status',
        },
      })
    })

    it('ignores union members without a structure', () => {
      const member = {
        kind: 'union',
        types: [
          {
            source: 'effect-schema',
            text: 'Unknown',
          },
          {
            source: 'effect-schema',
            text: 'String',
            structure: {
              kind: 'primitive',
              elementType: 'string',
            },
          },
        ],
      } as any as TypeStructureAnalysis

      expect(buildSchemaStructureNode(member, 'value')).toEqual({
        name: 'value',
        kind: 'union',
        children: [
          {
            name: 'String',
            kind: 'primitive',
            type: 'string',
            annotations: undefined,
          },
        ],
        annotations: undefined,
      })
    })

    it('returns an empty children array when no union member is effect-schema', () => {
      const member = {
        kind: 'union',
        types: [
          {
            source: 'typescript',
            text: 'string',
            structure: {
              kind: 'primitive',
              elementType: 'string',
            },
          },
        ],
      } as any as TypeStructureAnalysis

      expect(buildSchemaStructureNode(member, 'value')).toEqual({
        name: 'value',
        kind: 'union',
        children: [],
        annotations: undefined,
      })
    })
  })
})
