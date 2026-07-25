import type { PackageImportEntry } from './PackageImportEntry.js'
import type { PackageDependency } from './PackageDependency.js'
import type { PackageExportEntry } from './PackageExportEntry.js'

/**
 * Represents a parsed and analyzed package.json file containing metadata, dependencies, and configuration settings.
 */
export interface PackageJsonAnalysis {
  /**
   * パッケージ名
   */
  readonly name: string

  /**
   * バージョン
   */
  readonly version: string

  /**
   * Indicates whether the package is private.
   */
  readonly private: boolean

  /**
   * The package description.
   */
  readonly description?: string

  /**
   * The specified package manager, e.g., 'npm@x.y.z' or 'yarn@x.y.z'.
   */
  readonly packageManager?: string

  /**
   * package.jsonのtype
   */
  readonly moduleType: 'module' | 'commonjs'

  /**
   * エントリーポイント
   */
  readonly main?: string

  /**
   * TypeScript型定義
   */
  readonly types?: string

  /**
   * package exports
   */
  readonly exports: ReadonlyArray<PackageExportEntry>

  /**
   * package imports
   */
  readonly imports: ReadonlyArray<PackageImportEntry>

  /**
   * runtime dependency
   */
  readonly dependencies: ReadonlyArray<PackageDependency>

  /**
   * development dependency
   */
  readonly devDependencies: ReadonlyArray<PackageDependency>

  /**
   * peer dependency
   */
  readonly peerDependencies: ReadonlyArray<PackageDependency>

  /**
   * optional dependency
   */
  readonly optionalDependencies: ReadonlyArray<PackageDependency>

  readonly license: string
}
