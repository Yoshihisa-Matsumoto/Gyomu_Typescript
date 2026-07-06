import { Brand } from 'effect'

/**
 * Represents a path of segments identifying a member.
 */
export type MemberIdentityMemberPath = Array<string | number>

/**
 * Represents a unique identifier for a symbol as a string.
 */
export type SymbolId = Brand.Branded<string, 'SymbolId'>

/**
 * Nominal brand utility for SymbolId.
 */
export const SymbolId = Brand.nominal<SymbolId>()

/**
 * Represents a unique identifier for a signature as a string.
 */
export type SignatureId = Brand.Branded<string, 'SignatureId'>

/**
 * Nominal brand utility for SignatureId.
 */
export const SignatureId = Brand.nominal<SignatureId>()

// /**
//  * Represents the unique identifier for an owner symbol.
//  */
// export type MemberIdentityOwnerSymbolId = Brand.Branded<string, 'MemberIdentityOwnerSymbolId'>
// export const MemberIdentityOwnerSymbolId = Brand.nominal<MemberIdentityOwnerSymbolId>()

/**
 * Represents a file path relative to the project root as a string.
 */
export type ProjectRelativePath = Brand.Branded<string, 'ProjectRelativePath'>

/**
 * Nominal brand utility for ProjectRelativePath.
 */
export const ProjectRelativePath = Brand.nominal<ProjectRelativePath>()

/**
 * Represents an absolute file system path as a string.
 */
export type FullPath = Brand.Branded<string, 'FullPath'>

/**
 * Nominal brand utility for FullPath.
 */
export const FullPath = Brand.nominal<FullPath>()

/**
 * Represents a file path relative to the workspace root as a string.
 */
export type WorkspaceRelativePath = Brand.Branded<string, 'WorkspaceRelativePath'>

/**
 * Nominal brand utility for WorkspaceRelativePath.
 */
export const WorkspaceRelativePath = Brand.nominal<WorkspaceRelativePath>()
