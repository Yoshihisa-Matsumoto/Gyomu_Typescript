import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SignatureId, SymbolId } from '@gyomu/schema/typescript'
import { buildContextEntry } from '../buildContextEntry.js'
import { buildExistingJsDoc } from '../buildExistingJsDoc.js'
import type { FileAnalysisContext } from '@gyomu/schema/typescript'
import type { MemberAnalysis, SymbolAnalysis, TypeProperty } from '@gyomu/schema/schemas/typescript'

vi.mock('../buildExistingJsDoc.js', () => ({
  buildExistingJsDoc: vi.fn(),
}))

const mockedBuildExistingJsDoc = vi.mocked(buildExistingJsDoc)

const createIdentity = (name: string) => ({
  signatureId: SignatureId(`signature:${name}`),
  symbolId: SymbolId(name),
})

const createFileResult = (parsedJsDocs = new Map()): FileAnalysisContext =>
  ({
    metadata: {
      parsedJsDocs,
    },
  }) as any as FileAnalysisContext

const createParent = (overrides: Partial<SymbolAnalysis> = {}): SymbolAnalysis =>
  ({
    identity: createIdentity('Parent'),
    id: SymbolId('Parent'),
    location: {
      startLine: 1,
    },
    documentable: true,
    members: [],
    ...overrides,
  }) as SymbolAnalysis

const createMethod = (overrides: Record<string, unknown> = {}): MemberAnalysis =>
  ({
    id: SymbolId('method'),
    identity: createIdentity('method'),
    kind: 'method',
    name: 'execute',
    documentable: true,
    location: {
      startLine: 10,
    },
    parameters: [],
    ...overrides,
  }) as unknown as MemberAnalysis

const createProperty = (overrides: Record<string, unknown> = {}): MemberAnalysis =>
  ({
    id: SymbolId('property'),
    identity: createIdentity('property'),
    kind: 'property',
    name: 'value',
    documentable: true,
    location: {
      startLine: 10,
    },
    ...overrides,
  }) as MemberAnalysis

describe('buildContextEntry', () => {
  beforeEach(() => {
    mockedBuildExistingJsDoc.mockReset()
  })
  it('builds a method context entry', () => {
    mockedBuildExistingJsDoc.mockReturnValue({
      summary: 'Existing summary',
    } as any)

    const method = createMethod({
      returnType: {
        text: 'Promise<string>',
      },
      jsDoc: {
        exists: true,
      },
    })

    const result = buildContextEntry(createFileResult(), method, createParent())

    expect(result).toMatchObject({
      target: method.identity,
      kind: 'method',
      name: 'execute',
      type: 'Promise<string>',
      existingJsDoc: {
        summary: 'Existing summary',
      },
      documentable: true,
      children: [],
    })
  })

  it('includes effect signals from a method return type', () => {
    const method = createMethod({
      returnType: {
        text: 'Effect<string, Error, Service>',
        effect: {
          success: 'string',
          error: 'Error',
          requirements: 'Service',
        },
      },
    })

    const result = buildContextEntry(createFileResult(), method, createParent())

    expect(result.effectSignals).toEqual({
      success: 'string',
      error: 'Error',
      requirements: 'Service',
    })
  })

  it('omits effect signals when a method has no effect', () => {
    const method = createMethod({
      returnType: {
        text: 'string',
      },
    })

    const result = buildContextEntry(createFileResult(), method, createParent())

    expect(result.effectSignals).toBeUndefined()
  })

  it('builds child entries for method parameters', () => {
    const parameter = {
      id: SymbolId('parameter'),
      identity: createIdentity('parameter'),
      kind: 'property',
      name: 'input',
      documentable: true,
      optional: false,
      location: {
        startLine: 20,
      },
      type: {
        text: 'string',
      },
    }

    const method = createMethod({
      parameters: [parameter],
    })

    const result = buildContextEntry(createFileResult(), method, createParent())

    expect(result.children).toHaveLength(1)
    expect(result.children?.[0]).toMatchObject({
      target: parameter.identity,
      kind: 'property',
      name: 'input',
      type: 'string',
      documentable: true,
    })
  })

  it('builds a property context entry', () => {
    mockedBuildExistingJsDoc.mockReturnValue({
      summary: 'Existing property documentation',
    } as any)

    const property = createProperty({
      type: {
        text: 'string',
      },
      jsDoc: {
        exists: true,
      },
    })

    const result = buildContextEntry(createFileResult(), property, createParent())

    expect(result).toMatchObject({
      target: property.identity,
      kind: 'property',
      name: 'value',
      type: 'string',
      existingJsDoc: {
        summary: 'Existing property documentation',
      },
      children: [],
      documentable: true,
    })
  })

  it('builds children from object properties', () => {
    const child: TypeProperty = {
      id: SymbolId('name'),
      identity: createIdentity('name'),
      name: 'name',
      documentable: true,
      location: {
        startLine: 20,
      },
      type: {
        text: 'string',
      },
    } as TypeProperty

    const property = createProperty({
      type: {
        text: '{ name: string }',
        structure: {
          kind: 'object',
          properties: [child],
        },
      },
    })

    const result = buildContextEntry(createFileResult(), property, createParent())

    expect(result.children).toHaveLength(1)
    expect(result.children?.[0]).toMatchObject({
      target: child.identity,
      kind: 'type',
      name: 'name',
      type: 'string',
      documentable: true,
    })
  })

  it('builds children from function parameters', () => {
    const parameter: TypeProperty = {
      id: SymbolId('input'),
      identity: createIdentity('input'),
      name: 'input',
      documentable: true,
      location: {
        startLine: 20,
      },
      type: {
        text: 'string',
      },
    } as TypeProperty

    const property = createProperty({
      type: {
        text: '(input: string) => void',
        structure: {
          kind: 'function',
          parameters: [parameter],
        },
      },
    })

    const result = buildContextEntry(createFileResult(), property, createParent())

    expect(result.children).toHaveLength(1)
    expect(result.children?.[0]).toMatchObject({
      target: parameter.identity,
      kind: 'type',
      name: 'input',
      type: 'string',
    })
  })
  it('builds index signature children from nested type properties', () => {
    const indexSignature = {
      id: SymbolId('index'),
      identity: createIdentity('index'),
      parameterName: 'key',
      parameterType: {
        text: 'string',
      },
      type: {
        text: 'number',
      },
    }

    const child: TypeProperty = {
      id: SymbolId('config'),
      identity: createIdentity('config'),
      name: 'config',
      documentable: true,
      location: {
        startLine: 20,
      },
      type: {
        text: '{ [key: string]: number }',
        structure: {
          kind: 'object',
          properties: [],
          indexSignatures: [indexSignature],
        },
      },
    } as unknown as TypeProperty

    const property = createProperty({
      type: {
        text: '{ config: { [key: string]: number } }',
        structure: {
          kind: 'object',
          properties: [child],
        },
      },
    })

    const result = buildContextEntry(createFileResult(), property, createParent())

    expect(result.children).toHaveLength(1)

    expect(result.children?.[0]).toMatchObject({
      target: child.identity,
      kind: 'type',
      name: 'config',
    })

    expect(result.children?.[0]?.children).toHaveLength(1)

    expect(result.children?.[0]?.children?.[0]).toMatchObject({
      target: indexSignature.identity,
      kind: 'type',
      name: 'key',
      type: 'number',
      children: [],
    })
  })

  it('includes effect signals for property types', () => {
    const property = createProperty({
      type: {
        text: 'Effect<string, Error, Service>',
        effect: {
          success: 'string',
          error: 'Error',
          requirements: 'Service',
        },
      },
    })

    const result = buildContextEntry(createFileResult(), property, createParent())

    expect(result.effectSignals).toEqual({
      success: 'string',
      error: 'Error',
      requirements: 'Service',
    })
  })

  it('marks a non-documentable member as non-documentable', () => {
    const property = createProperty({
      documentable: false,
    })

    const result = buildContextEntry(createFileResult(), property, createParent())

    expect(result).toMatchObject({
      documentable: false,
      reason: 'non-documentable-member',
      kind: 'parameter',
    })
  })

  it('marks a member as non-documentable when its parent is non-documentable', () => {
    const parent = createParent({
      documentable: false,
    } as any)

    const property = createProperty()

    const result = buildContextEntry(createFileResult(), property, parent)

    expect(result).toMatchObject({
      documentable: false,
      reason: 'non-documentable-member',
    })
  })

  it('marks an inline object member as non-documentable', () => {
    const parent = createParent({
      location: {
        startLine: 10,
        endLine: 10,
      },
    })

    const property = createProperty({
      location: {
        startLine: 10,
      },
    })

    const result = buildContextEntry(createFileResult(), property, parent)

    expect(result).toMatchObject({
      documentable: false,
      reason: 'inline-object-member',
    })
  })

  it('allows a member on a different line to be documentable', () => {
    const parent = createParent({
      location: {
        startLine: 10,
        endLine: 10,
      },
    })

    const property = createProperty({
      location: {
        startLine: 20,
      },
    })

    const result = buildContextEntry(createFileResult(), property, parent)

    expect(result).toMatchObject({
      documentable: true,
    })
  })

  it('does not include optional fields when their values are undefined', () => {
    mockedBuildExistingJsDoc.mockReturnValue(undefined)
    const property = createProperty()

    const result = buildContextEntry(createFileResult(), property, createParent())

    expect(mockedBuildExistingJsDoc).toHaveBeenCalledWith(undefined, undefined)
    expect(result).not.toHaveProperty('type')
    expect(result).not.toHaveProperty('existingJsDoc')
  })

  it('uses parsed JSDoc for the member', () => {
    const parsedJsDoc = {
      summary: 'Parsed documentation',
    }

    mockedBuildExistingJsDoc.mockReturnValue({
      summary: 'Existing documentation',
    } as any)

    const property = createProperty({
      jsDoc: {
        exists: true,
      },
    })

    const fileResult = createFileResult(new Map([[property.id, parsedJsDoc]]))

    buildContextEntry(fileResult, property, createParent())

    expect(property.documentable).toBeTruthy()
    if (property.documentable) {
      expect(mockedBuildExistingJsDoc).toHaveBeenCalledWith(property.jsDoc, parsedJsDoc)
    }
  })

  it('does not use JSDoc analysis for a non-documentable member', () => {
    const property = createProperty({
      documentable: false,
      jsDoc: {
        exists: true,
      },
    })

    buildContextEntry(createFileResult(), property, createParent())

    expect(mockedBuildExistingJsDoc).toHaveBeenCalledWith(undefined, undefined)
  })
})
