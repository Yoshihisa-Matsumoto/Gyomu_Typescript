import { Brand } from 'effect'

/**
 * Represents a path of segments identifying a member.
 */
export type MemberIdentityMemberPath = Array<string | number>

/**
 * Represents a unique identifier for a symbol as a string.
 */
export type SymbolId = Brand.Branded<string, 'SymbolId'>
export const SymbolId = Brand.nominal<SymbolId>()

export type SignatureId = Brand.Branded<string, 'SignatureId'>
export const SignatureId = Brand.nominal<SignatureId>()

// /**
//  * Represents the unique identifier for an owner symbol.
//  */
// export type MemberIdentityOwnerSymbolId = Brand.Branded<string, 'MemberIdentityOwnerSymbolId'>
// export const MemberIdentityOwnerSymbolId = Brand.nominal<MemberIdentityOwnerSymbolId>()

export type ProjectRelativePath = Brand.Branded<string, 'ProjectRelativePath'>
export const ProjectRelativePath = Brand.nominal<ProjectRelativePath>()

export type FullPath = Brand.Branded<string, 'FullPath'>
export const FullPath = Brand.nominal<FullPath>()

export type WorkspaceRelativePath = Brand.Branded<string, 'WorkspaceRelativePath'>
export const WorkspaceRelativePath = Brand.nominal<WorkspaceRelativePath>()
