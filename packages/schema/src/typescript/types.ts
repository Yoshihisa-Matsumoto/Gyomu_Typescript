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

/**
 * Represents a file path relative to the directory as a string.
 */
export type DirectoryRelativePath = Brand.Branded<string, 'DirectoryRelativePath'>

/**
 * Nominal brand utility for DirectoryRelativePath.
 */
export const DirectoryRelativePath = Brand.nominal<DirectoryRelativePath>()

/**
 * Represents a file path relative to the project root as a string.
 */
export type ProjectRelativePath = Brand.Branded<string, 'ProjectRelativePath'>

/**
 * Nominal brand utility for ProjectRelativePath.
 */
export const ProjectRelativePath = Brand.nominal<ProjectRelativePath>()

/**
 * Represents a file path relative to the workspace root as a string.
 */
export type WorkspaceRelativePath = Brand.Branded<string, 'WorkspaceRelativePath'>

/**
 * Nominal brand utility for WorkspaceRelativePath.
 */
export const WorkspaceRelativePath = Brand.nominal<WorkspaceRelativePath>()
