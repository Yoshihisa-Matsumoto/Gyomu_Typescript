/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import path, { join } from 'node:path'
import { writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { describe, expect, it } from 'vitest'
import { Effect } from 'effect'
import { equalSymbolIdentity } from '@gyomu/schema/schemas/typescript/SymbolIdentity'
import { ProjectRelativePath } from '@gyomu/schema/typescript'
import { analyzeFile } from '../analyzeFile.js'
import { createFixtureProject } from './createFixtureProject.js'
import type {
  DocumentableMemberAnalysis,
  DocumentableMethodMemberAnalysis,
  DocumentablePropertyMemberAnalysis,
  MemberAnalysis,
  TypeAnalysis,
} from '@gyomu/schema/typescript'
import type { FileAnalysisResult } from '../file/FileAnalysisResult.js'

const timeout = 20000

const jsDocFixture = createFixtureProject(path.join('analysis', 'jsdoc'))

const tempJsdocProgram = (sourceFile: string) => {
  const { project, projectRoot, projectName } = jsDocFixture

  const filePath = ProjectRelativePath(path.join('src', sourceFile))
  return Effect.runSync(
    Effect.gen(function* () {
      return yield* analyzeFile(jsDocFixture, filePath, {
        includeDebugInfo: true,
      })
    }),
  )
}

describe('analyzeFile-complex pattern', () => {
  const getMethod = (
    name: string,
    members: Array<MemberAnalysis>,
  ): DocumentableMethodMemberAnalysis => {
    const member = members.find((m) => m.name == name && m.kind == 'method')
    if (!member) throw new Error(`${member} Not Found`)
    return member as DocumentableMethodMemberAnalysis
  }

  const getProperty = (
    name: string,
    members: Array<MemberAnalysis>,
  ): DocumentablePropertyMemberAnalysis => {
    const member = members.find((m) => m.name == name && m.kind == 'property')
    if (!member) throw new Error(`${member} Not Found`)
    return member as DocumentablePropertyMemberAnalysis
  }
  const getObjectType = (typeNode: TypeAnalysis) => {
    if (!typeNode.structure || typeNode.structure.kind != 'object')
      throw new Error(`object type not found on ${typeNode.text}`)
    return typeNode.structure
  }
  const getArrayType = (typeNode: TypeAnalysis) => {
    if (!typeNode.structure || typeNode.structure.kind != 'array')
      throw new Error(`array type not found on ${typeNode.text}`)
    return typeNode.structure
  }
  const getUnionType = (typeNode: TypeAnalysis) => {
    if (!typeNode.structure || typeNode.structure.kind != 'union')
      throw new Error(`union type not found on ${typeNode.text}`)
    return typeNode.structure
  }
  const getParsedJsDoc = (result: FileAnalysisResult, member: DocumentableMemberAnalysis) => {
    const id = member.id
    const jsdoc = result.metadata.parsedJsDocs.get(id)
    if (!jsdoc) throw new Error(`ParsedJsDoc for ${member.name} Not Found`)
    return jsdoc
  }

  it(
    'analyzes 01-class-members.ts',
    async () => {
      const result = await tempJsdocProgram('01-class-members.ts')

      expect(result.metadata.parsedJsDocs.size).toBe(5)

      const exported = result.analysis.exports[0]
      expect(exported?.exportedName).toBe('UserService')

      const symbol = result.analysis.symbols[0]

      expect(symbol?.kind).toBe('class')
      expect(symbol?.identity).toEqual({
        symbolId: 'UserService',
        signatureId: 'class',
      })

      expect(symbol?.jsDoc).toMatchObject({
        exists: true,
        hasSummary: true,
        summaryLength: 13,
      })

      expect(symbol?.members).toHaveLength(4)
      const members = symbol?.members!
      const name = getProperty('name', members)
      const constructorMethod = getMethod('$constructor', members)
      const getUser = getMethod('getUser', members)
      const deleteUser = getMethod('deleteUser', members)
      // property

      expect(name.kind).toBe('property')

      expect(name.identity).toEqual({
        symbolId: 'UserService::class::$member.name::property',
        signatureId: 'property',
      })

      expect(name.jsDoc).toMatchObject({
        exists: true,
        hasSummary: true,
      })

      expect(getParsedJsDoc(result, name).summary).toBe('User name.')

      // constructor

      expect(constructorMethod.kind).toBe('method')

      expect(constructorMethod.identity).toEqual({
        symbolId: 'UserService::class::$constructor::():UserService',
        signatureId: '():UserService',
      })

      expect(getParsedJsDoc(result, constructorMethod).summary).toBe('Creates service.')

      // getUser

      expect(getUser.kind).toBe('method')

      expect(getUser.identity).toEqual({
        symbolId: 'UserService::class::getUser::(id:string):string',
        signatureId: '(id:string):string',
      })

      expect(getUser.parameters).toMatchObject([
        {
          name: 'id',
          optional: false,
          rest: false,
          type: {
            text: 'string',
          },
        },
      ])

      const getUserDoc = getParsedJsDoc(result, getUser)

      expect(getUserDoc.summary).toBe('Gets user.')

      expect(getUserDoc.params).toEqual([
        {
          name: 'id',
          description: 'User id',
          optional: false,
          raw: expect.any(String),
          sortOrder: 0,
        },
      ])

      expect(getUserDoc.returns).toMatchObject({
        description: 'User name',
        raw: expect.any(String),
      })

      // private method

      expect(deleteUser.kind).toBe('method')

      expect(deleteUser.identity).toMatchObject({
        symbolId: 'UserService::class::deleteUser::():void',
        signatureId: '():void',
      })

      expect(deleteUser.visibility).toBe('private')

      expect(getParsedJsDoc(result, deleteUser).summary).toBe('Deletes user.')
    },
    timeout,
  )
  it(
    'analyzes 02-interface-members.ts',
    async () => {
      const result = await tempJsdocProgram('02-interface-members.ts')
      console.dir(result, { depth: null })
      expect(result.metadata.parsedJsDocs.size).toBe(4)

      const exported = result.analysis.exports.filter((e) => e.kind == 'local')[0]
      if (!exported) {
        throw new Error('Unexpected')
      }
      expect(exported.exportedName).toBe('UserService')

      const symbol = result.analysis.symbols.find((s) =>
        equalSymbolIdentity(s.identity, exported.identity),
      )
      expect(symbol?.kind).toBe('interface')
      expect(symbol?.identity).toEqual({
        symbolId: 'UserService',
        signatureId: 'interface',
      })

      expect(symbol?.jsDoc).toMatchObject({
        exists: true,
        hasSummary: true,
        summaryLength: 14,
      })

      expect(symbol?.members).toHaveLength(3)

      const members = symbol?.members!

      const id = getProperty('id', members)
      const name = getProperty('name', members)
      const getUser = getMethod('getUser', members)

      // id

      expect(id.kind).toBe('property')

      expect(id.identity).toEqual({
        symbolId: 'UserService::interface::$member.id::property',
        signatureId: 'property',
      })

      expect(id.jsDoc).toMatchObject({
        exists: true,
        hasSummary: true,
      })

      expect(getParsedJsDoc(result, id).summary).toBe('User id.')

      // name

      expect(name.kind).toBe('property')

      expect(name.identity).toEqual({
        symbolId: 'UserService::interface::$member.name::property',
        signatureId: 'property',
      })

      expect(name.jsDoc).toMatchObject({
        exists: true,
        hasSummary: true,
      })

      expect(getParsedJsDoc(result, name).summary).toBe('User name.')

      // getUser

      expect(getUser.kind).toBe('method')

      expect(getUser.identity).toMatchObject({
        symbolId: 'UserService::interface::$member.getUser::(id:string):string',
        signatureId: '(id:string):string',
      })

      expect(getUser.parameters).toMatchObject([
        {
          name: 'id',
          optional: false,
          rest: false,
          type: {
            text: 'string',
          },
        },
      ])

      const getUserDoc = getParsedJsDoc(result, getUser)
      console.dir(getUser, { depth: null })
      console.dir(getUserDoc, { depth: null })
      expect(getUserDoc.summary).toBe('Gets user.')

      expect(getUserDoc.params).toEqual([
        {
          name: 'id',
          description: 'User id',
          optional: false,
          raw: expect.any(String),
          sortOrder: 0,
        },
      ])
    },
    timeout,
  )
  it(
    'analyzes 03-type-literal.ts',
    async () => {
      const result = await tempJsdocProgram('03-type-literal.ts')

      expect(result.metadata.parsedJsDocs.size).toBe(4)

      const exported = result.analysis.exports[0]
      expect(exported?.exportedName).toBe('User')

      const symbol = result.analysis.symbols[0]

      expect(symbol?.kind).toBe('type')
      expect(symbol?.identity).toEqual({
        symbolId: 'User',
        signatureId: 'type',
      })

      expect(symbol?.jsDoc).toMatchObject({
        exists: true,
        hasSummary: true,
        summaryLength: 10,
      })

      expect(symbol?.members).toHaveLength(3)

      const members = symbol?.members!

      const id = getProperty('id', members)
      const name = getProperty('name', members)
      const getDisplayName = getMethod('getDisplayName', members)

      // id

      expect(id.kind).toBe('property')

      expect(id.identity).toEqual({
        symbolId: 'User::type::$member.id::property',
        signatureId: 'property',
      })

      expect(id.jsDoc).toMatchObject({
        exists: true,
        hasSummary: true,
      })

      expect(getParsedJsDoc(result, id).summary).toBe('User id.')

      // name

      expect(name.kind).toBe('property')

      expect(name.identity).toEqual({
        symbolId: 'User::type::$member.name::property',
        signatureId: 'property',
      })

      expect(name.jsDoc).toMatchObject({
        exists: true,
        hasSummary: true,
      })

      expect(getParsedJsDoc(result, name).summary).toBe('User name.')

      // getDisplayName

      expect(getDisplayName.kind).toBe('method')
      expect(getDisplayName.identity).toMatchObject({
        symbolId: 'User::type::$member.getDisplayName::():string',
        signatureId: '():string',
      })

      expect(getDisplayName.parameters).toEqual([])

      const getDisplayNameDoc = getParsedJsDoc(result, getDisplayName)

      expect(getDisplayNameDoc.summary).toBe('Gets display name.')
    },
    timeout,
  )
  it(
    'analyzes 04-function-property.ts',
    async () => {
      const result = await tempJsdocProgram('04-function-property.ts')
      console.dir(result, { depth: null })
      expect(result.metadata.parsedJsDocs.size).toBe(2)

      const exported = result.analysis.exports[0]
      expect(exported?.exportedName).toBe('Repository')

      const symbol = result.analysis.symbols[0]

      expect(symbol?.kind).toBe('interface')
      expect(symbol?.identity).toEqual({
        symbolId: 'Repository',
        signatureId: 'interface',
      })

      expect(symbol?.jsDoc).toBeUndefined()

      expect(symbol?.members).toHaveLength(2)

      const members = symbol?.members!

      const save = getMethod('save', members)
      const deleteMethod = getMethod('delete', members)

      // save

      expect(save.kind).toBe('method')

      expect(save.identity).toMatchObject({
        symbolId: 'Repository::interface::$member.save::(id:string):Promise<void>',
        signatureId: '(id:string):Promise<void>',
      })

      expect(save.parameters).toMatchObject([
        {
          name: 'id',
          optional: false,
          rest: false,
          type: {
            text: 'string',
          },
        },
      ])

      const saveDoc = getParsedJsDoc(result, save)

      expect(saveDoc.summary).toBe('Save user.')
      expect(saveDoc.params).toEqual([])

      // delete

      expect(deleteMethod.kind).toBe('method')

      expect(deleteMethod.identity).toMatchObject({
        symbolId: 'Repository::interface::$member.delete::(id:string):Promise<void>',
        signatureId: '(id:string):Promise<void>',
      })

      expect(deleteMethod.parameters).toMatchObject([
        {
          name: 'id',
          optional: false,
          rest: false,
          type: {
            text: 'string',
          },
        },
      ])

      const deleteDoc = getParsedJsDoc(result, deleteMethod)

      expect(deleteDoc.summary).toBe('Delete user.')
      expect(deleteDoc.params).toEqual([])
    },
    timeout,
  )
  it(
    'analyzes 05-nested-type.ts',
    async () => {
      const result = await tempJsdocProgram('05-nested-type.ts')

      console.dir(result, { depth: null })
      expect(result.metadata.parsedJsDocs.size).toBe(3)

      const exported = result.analysis.exports[0]
      expect(exported?.exportedName).toBe('ApiResponse')

      const symbol = result.analysis.symbols[0]

      expect(symbol?.kind).toBe('interface')
      expect(symbol?.identity).toEqual({
        symbolId: 'ApiResponse',
        signatureId: 'interface',
      })

      expect(symbol?.members).toHaveLength(1)

      const members = symbol?.members!

      const data = getProperty('data', members)

      // data

      expect(data.kind).toBe('property')

      expect(data.identity).toEqual({
        symbolId: 'ApiResponse::interface::$member.data::property',
        signatureId: 'property',
      })

      expect(data.jsDoc).toMatchObject({
        exists: true,
        hasSummary: true,
      })

      expect(getParsedJsDoc(result, data).summary).toBe('Response data.')

      // nested members
      const dataType = getObjectType(data.type!)
      expect(dataType.members).toHaveLength(2)

      const id = getProperty('id', dataType.members!)
      const name = getProperty('name', dataType.members!)

      expect(id.kind).toBe('property')

      expect(id.identity).toEqual({
        symbolId: 'ApiResponse::interface::$member.data.$member.id::property',
        signatureId: 'property',
      })

      expect(id.jsDoc).toMatchObject({
        exists: true,
        hasSummary: true,
      })

      expect(getParsedJsDoc(result, id).summary).toBe('User id.')

      expect(name.kind).toBe('property')

      expect(name.identity).toEqual({
        symbolId: 'ApiResponse::interface::$member.data.$member.name::property',
        signatureId: 'property',
      })

      expect(name.jsDoc).toMatchObject({
        exists: true,
        hasSummary: true,
      })

      expect(getParsedJsDoc(result, name).summary).toBe('User name.')
    },
    timeout,
  )
  it(
    'analyzes 06-overload.ts',
    async () => {
      const result = await tempJsdocProgram('06-overload.ts')

      expect(result.metadata.parsedJsDocs.size).toBe(2)

      const exported = result.analysis.exports[0]
      expect(exported?.exportedName).toBe('Formatter')

      const symbol = result.analysis.symbols[0]

      expect(symbol?.kind).toBe('interface')
      expect(symbol?.identity).toEqual({
        symbolId: 'Formatter',
        signatureId: 'interface',
      })

      expect(symbol?.members).toHaveLength(2)

      const members = symbol?.members!

      const stringFormat = members.find(
        (m) =>
          m.kind === 'method' &&
          m.name === 'format' &&
          m.identity.signatureId === '(value:string):string',
      ) as DocumentableMethodMemberAnalysis

      const numberFormat = members.find(
        (m) =>
          m.kind === 'method' &&
          m.name === 'format' &&
          m.identity.signatureId === '(value:number):string',
      ) as DocumentableMethodMemberAnalysis

      expect(stringFormat).toBeDefined()
      expect(numberFormat).toBeDefined()

      // string overload

      expect(stringFormat!.identity).toEqual({
        symbolId: 'Formatter::interface::$member.format::(value:string):string',
        signatureId: '(value:string):string',
      })

      expect(stringFormat!.parameters).toMatchObject([
        {
          name: 'value',
          optional: false,
          rest: false,
          type: {
            text: 'string',
          },
        },
      ])

      const stringDoc = getParsedJsDoc(result, stringFormat!)

      expect(stringDoc.summary).toBe('Format string.')

      // number overload

      expect(numberFormat!.identity).toEqual({
        symbolId: 'Formatter::interface::$member.format::(value:number):string',
        signatureId: '(value:number):string',
      })

      expect(numberFormat!.parameters).toMatchObject([
        {
          name: 'value',
          optional: false,
          rest: false,
          type: {
            text: 'number',
          },
        },
      ])

      const numberDoc = getParsedJsDoc(result, numberFormat!)

      expect(numberDoc.summary).toBe('Format number.')
    },
    timeout,
  )
  it(
    'analyzes 07-mixed-member-docs.ts',
    async () => {
      const result = await tempJsdocProgram('07-mixed-member-docs.ts')

      expect(result.metadata.parsedJsDocs.size).toBe(3)

      const exported = result.analysis.exports[0]
      expect(exported?.exportedName).toBe('MixedService')

      const symbol = result.analysis.symbols[0]

      expect(symbol?.kind).toBe('class')

      expect(symbol?.identity).toEqual({
        symbolId: 'MixedService',
        signatureId: 'class',
      })

      expect(symbol?.members).toHaveLength(3)

      const members = symbol?.members!

      const generatedMethod = getMethod('generatedMethod', members)
      const humanEditedMethod = getMethod('humanEditedMethod', members)
      const name = getProperty('name', members)

      // generatedMethod

      expect(generatedMethod.kind).toBe('method')

      expect(generatedMethod.identity).toEqual({
        symbolId: 'MixedService::class::generatedMethod::():void',
        signatureId: '():void',
      })

      const generatedDoc = getParsedJsDoc(result, generatedMethod)

      expect(generatedDoc.summary).toBe('Generated method.')

      expect(generatedMethod.jsDoc).toMatchObject({
        exists: true,
        hasSummary: true,
      })

      // GeneratedBy tag

      expect(generatedDoc.tags).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            tagName: 'GeneratedBy',
          }),
        ]),
      )

      // humanEditedMethod

      expect(humanEditedMethod.kind).toBe('method')

      expect(humanEditedMethod.identity).toEqual({
        symbolId: 'MixedService::class::humanEditedMethod::():void',
        signatureId: '():void',
      })

      const humanDoc = getParsedJsDoc(result, humanEditedMethod)

      expect(humanDoc.summary).toBe('# Human Edited Method')

      expect(humanEditedMethod.jsDoc).toMatchObject({
        exists: true,
        hasSummary: true,
      })

      // Human Edited Signal

      expect(humanEditedMethod.jsDoc).toMatchObject({
        hasHumanEditedSections: true,
      })

      // name

      expect(name.kind).toBe('property')

      expect(name.identity).toEqual({
        symbolId: 'MixedService::class::$member.name::property',
        signatureId: 'property',
      })

      expect(getParsedJsDoc(result, name).summary).toBe('User name.')

      expect(name.jsDoc).toMatchObject({
        exists: true,
        hasSummary: true,
      })
    },
    timeout,
  )

  it(
    'analyzes 08-complex-nested-type.ts',
    async () => {
      const result = await tempJsdocProgram('08-complex-nested-type.ts')

      expect(result.metadata.parsedJsDocs.size).toBe(8)

      const exported = result.analysis.exports[0]
      expect(exported?.exportedName).toBe('ApiResponse')

      const symbol = result.analysis.symbols[0]

      expect(symbol?.kind).toBe('interface')

      expect(symbol?.identity).toEqual({
        symbolId: 'ApiResponse',
        signatureId: 'interface',
      })

      const data = getProperty('data', symbol?.members!)

      expect(data.identity).toEqual({
        symbolId: 'ApiResponse::interface::$member.data::property',
        signatureId: 'property',
      })

      expect(getParsedJsDoc(result, data).summary).toBe('Response payload.')

      // user
      const dataType = getObjectType(data.type!)
      const user = getProperty('user', dataType.members!)

      expect(user.identity).toEqual({
        symbolId: 'ApiResponse::interface::$member.data.$member.user::property',
        signatureId: 'property',
      })

      expect(getParsedJsDoc(result, user).summary).toBe('User information.')

      // id
      const userType = getObjectType(user.type!)
      const id = getProperty('id', userType.members!)

      expect(id.identity).toEqual({
        symbolId: 'ApiResponse::interface::$member.data.$member.user.$member.id::property',
        signatureId: 'property',
      })

      expect(id.readonly).toBe(true)

      expect(getParsedJsDoc(result, id).summary).toBe('User id.')

      // name

      const name = getProperty('name', userType.members!)

      expect(name.identity).toEqual({
        symbolId: 'ApiResponse::interface::$member.data.$member.user.$member.name::property',
        signatureId: 'property',
      })

      expect(name.optional).toBe(true)

      expect(getParsedJsDoc(result, name).summary).toBe('User name.')

      // metadata

      const metadata = getProperty('metadata', dataType.members!)

      expect(metadata.identity).toEqual({
        symbolId: 'ApiResponse::interface::$member.data.$member.metadata::property',
        signatureId: 'property',
      })

      expect(getParsedJsDoc(result, metadata).summary).toBe('Metadata.')

      // createdAt
      const metadataType = getObjectType(metadata.type!)
      const createdAt = getProperty('createdAt', metadataType.members!)

      expect(createdAt.identity).toEqual({
        symbolId:
          'ApiResponse::interface::$member.data.$member.metadata.$member.createdAt::property',
        signatureId: 'property',
      })

      expect(getParsedJsDoc(result, createdAt).summary).toBe('Creation time.')

      // tags

      const tags = getProperty('tags', metadataType.members!)

      expect(tags.identity).toEqual({
        symbolId: 'ApiResponse::interface::$member.data.$member.metadata.$member.tags::property',
        signatureId: 'property',
      })

      expect(getParsedJsDoc(result, tags).summary).toBe('Tags.')
    },
    timeout,
  )
  it(
    'analyzes 09-deep-complex-type.ts',
    async () => {
      const result = await tempJsdocProgram('09-deep-complex-type.ts')
      writeFileSync(join(tmpdir(), '09-deep-complex-type.txt'), JSON.stringify(result, null, 2))
      // console.dir(result.analysis, { depth: null })
      const exported = result.analysis.exports[0]
      expect(exported?.exportedName).toBe('ApiResponse')

      const symbol = result.analysis.symbols[0]

      expect(symbol?.kind).toBe('interface')

      expect(symbol?.identity).toEqual({
        symbolId: 'ApiResponse',
        signatureId: 'interface',
      })

      const members = symbol?.members!

      // data
      console.log('data')
      const data = getProperty('data', members)

      expect(data.identity).toEqual({
        symbolId: 'ApiResponse::interface::$member.data::property',
        signatureId: 'property',
      })

      expect(getParsedJsDoc(result, data).summary).toBe('Response payload.')
      console.dir(data, { depth: null })
      const dataType = getObjectType(data.type!)
      // users
      console.log('users')

      const users = getProperty('users', dataType.members!)

      expect(users.identity).toEqual({
        symbolId: 'ApiResponse::interface::$member.data.$member.users::property',
        signatureId: 'property',
      })

      expect(getParsedJsDoc(result, users).summary).toBe('Users.')

      const usersType = getArrayType(users.type!)

      const usersArrayType = getObjectType(usersType.elementType)
      // users.id
      console.log('users.id')
      const userId = getProperty('id', usersArrayType.members!)

      expect(userId.identity).toEqual({
        symbolId: 'ApiResponse::interface::$member.data.$member.users.$member.id::property',
        signatureId: 'property',
      })

      expect(getParsedJsDoc(result, userId).summary).toBe('User id.')

      // actions
      console.log('actions')
      const actions = getProperty('actions', dataType.members!)

      expect(actions.identity).toEqual({
        symbolId: 'ApiResponse::interface::$member.data.$member.actions::property',
        signatureId: 'property',
      })

      expect(getParsedJsDoc(result, actions).summary).toBe('Service actions.')

      const actionsType = getObjectType(actions.type!)
      console.dir(actionsType, { depth: null })
      // findUser
      console.log('findUser')
      const findUser = getMethod('findUser', actionsType.members!)

      expect(findUser.identity).toEqual({
        symbolId:
          'ApiResponse::interface::$member.data.$member.actions.$member.findUser::(id:string):{ id: string; name: string; }',
        signatureId: '(id:string):{ id: string; name: string; }',
      })

      expect(getParsedJsDoc(result, findUser).summary).toBe('Finds user.')

      // notify
      console.log('notify')
      const notify = getMethod('notify', actionsType.members!)

      expect(notify.identity).toEqual({
        symbolId:
          'ApiResponse::interface::$member.data.$member.actions.$member.notify::(message:string,callback:(success: boolean) => void):void',
        signatureId: '(message:string,callback:(success: boolean) => void):void',
      })

      expect(getParsedJsDoc(result, notify).summary).toBe('Notifies user.')

      // 深い階層のJSDocが取れていること
      console.log('深い階層のJSDoc')
      const userName = getProperty('name', usersArrayType.members!)

      expect(getParsedJsDoc(result, userName).summary).toBe('User name.')

      expect(result.metadata.parsedJsDocs.size).toBeGreaterThan(8)
    },
    timeout,
  )
  it(
    'analyzes 10-union-type.ts',
    async () => {
      const result = await tempJsdocProgram('10-union-type.ts')

      console.dir(result, { depth: null })

      expect(result.metadata.parsedJsDocs.size).toBe(8)

      const exported = result.analysis.exports[0]

      expect(exported?.exportedName).toBe('SearchResponse')

      const symbol = result.analysis.symbols[0]

      expect(symbol?.kind).toBe('interface')

      expect(symbol?.identity).toEqual({
        symbolId: 'SearchResponse',
        signatureId: 'interface',
      })

      const members = symbol?.members!

      //
      // status
      //

      const status = getProperty('status', members)

      expect(status.identity).toEqual({
        symbolId: 'SearchResponse::interface::$member.status::property',
        signatureId: 'property',
      })

      expect(getParsedJsDoc(result, status).summary).toBe('Status.')

      const statusType = getUnionType(status.type!)

      expect(statusType.types).toHaveLength(2)

      //
      // data
      //

      const data = getProperty('data', members)

      expect(data.identity).toEqual({
        symbolId: 'SearchResponse::interface::$member.data::property',
        signatureId: 'property',
      })

      expect(getParsedJsDoc(result, data).summary).toBe('Result data.')

      const dataType = getUnionType(data.type!)

      expect(dataType.types).toHaveLength(2)

      //
      // success branch
      //

      const successType = getObjectType(dataType.types[0]!)

      expect(successType.members).toHaveLength(2)

      const id = getProperty('id', successType.members!)

      expect(id.identity).toEqual({
        symbolId: 'SearchResponse::interface::$member.data.0.$member.id::property',
        signatureId: 'property',
      })

      expect(getParsedJsDoc(result, id).summary).toBe('User id.')

      const name = getProperty('name', successType.members!)

      expect(name.identity).toEqual({
        symbolId: 'SearchResponse::interface::$member.data.0.$member.name::property',
        signatureId: 'property',
      })

      expect(getParsedJsDoc(result, name).summary).toBe('User name.')

      //
      // error branch
      //

      const errorType = getObjectType(dataType.types[1]!)

      expect(errorType.members).toHaveLength(2)

      const code = getProperty('code', errorType.members!)

      expect(code.identity).toEqual({
        symbolId: 'SearchResponse::interface::$member.data.1.$member.code::property',
        signatureId: 'property',
      })

      expect(getParsedJsDoc(result, code).summary).toBe('Error code.')

      const message = getProperty('message', errorType.members!)

      expect(message.identity).toEqual({
        symbolId: 'SearchResponse::interface::$member.data.1.$member.message::property',
        signatureId: 'property',
      })

      expect(getParsedJsDoc(result, message).summary).toBe('Error message.')

      //
      // tags
      //

      const tags = getProperty('tags', members)

      expect(tags.identity).toEqual({
        symbolId: 'SearchResponse::interface::$member.tags::property',
        signatureId: 'property',
      })

      expect(getParsedJsDoc(result, tags).summary).toBe('Tags.')

      const tagsType = getUnionType(tags.type!)

      expect(tagsType.types).toHaveLength(2)

      expect(getArrayType(tagsType.types[0]!).elementType.text).toBe('string')

      expect(getArrayType(tagsType.types[1]!).elementType.text).toBe('number')
    },
    timeout,
  )
})
