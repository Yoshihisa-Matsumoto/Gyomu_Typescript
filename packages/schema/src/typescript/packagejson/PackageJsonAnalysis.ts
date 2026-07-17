import type { PackageImportEntry } from './PackageImportEntry.js'
import type { PackageDependency } from './PackageDependency.js'
import type { PackageExportEntry } from './PackageExportEntry.js'

export interface PackageJsonAnalysis {
  /**
   * パッケージ名
   */
  readonly name: string

  /**
   * バージョン
   */
  readonly version: string

  readonly private: boolean

  readonly description?: string

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
}
