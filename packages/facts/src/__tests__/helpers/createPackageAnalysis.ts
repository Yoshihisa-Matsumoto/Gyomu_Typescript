import type { DeepPartial } from '@gyomu/schema'
import type { PackageAnalysis } from '@gyomu/schema/concept'

type CreatePackageAnalysisOptions = {
  package?: DeepPartial<PackageAnalysis['package']>
  dependencies?: PackageAnalysis['dependencies']
  exports?: PackageAnalysis['exports']
  directories?: PackageAnalysis['directories']
}

export const createPackageAnalysis = (
  options: CreatePackageAnalysisOptions = {},
): PackageAnalysis => ({
  package: {
    name: options.package?.name ?? 'test-package',
    version: options.package?.version ?? '1.0.0',
    private: false,
    type: 'module',
    license: 'MIT',
  },

  dependencies: options.dependencies ?? [],

  exports: options.exports ?? [],
  exportedFiles: [],
  directories: options.directories ?? [],
})
