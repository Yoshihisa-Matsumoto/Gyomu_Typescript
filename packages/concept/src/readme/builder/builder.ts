import { buildArchitecture } from './sections/buildArchitecture.js'
import { buildDependencies } from './sections/buildDependencies.js'
import { buildDevelopment } from './sections/buildDevelopment.js'
import { buildInstallation } from './sections/buildInstallation.js'
import { buildLicense } from './sections/buildLicense.js'
import { buildOverview } from './sections/buildOverview.js'
import { buildPublicApi } from './sections/buildPublicApi.js'

export const README_SECTION_BUILDERS = [
  buildOverview,
  buildArchitecture,
  buildInstallation,
  buildDependencies,
  buildDevelopment,
  buildPublicApi,
  buildLicense,
] as const
