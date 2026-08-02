import { buildArchitecture } from './sections/buildArchitecture.js'
import { buildDependencies } from './sections/buildDependencies.js'
import { buildDevelopment } from './sections/buildDevelopment.js'
import { buildInstallation } from './sections/buildInstallation.js'
import { buildLicense } from './sections/buildLicense.js'
import { buildOverview } from './sections/buildOverview.js'
import { buildPublicApi } from './sections/buildPublicApi.js'
import type { SectionBuilder } from '../../document/builder/SectionBuilder.js'
import type { ReadmeBuildContext, ReadmeSectionId } from '@gyomu/schema/concept'

/**
 * An array of builder functions used to construct sections of the README document.
 */
export const README_SECTION_BUILDERS: ReadonlyArray<
  SectionBuilder<ReadmeSectionId, ReadmeBuildContext, any>
> = [
  buildOverview, // paragraph + AI
  buildArchitecture, // paragraph + AI
  buildInstallation, // paragraph + code
  buildDependencies, // paragraph + AI
  buildDevelopment, // paragraph + AI
  buildPublicApi, // bullet-list
  buildLicense, // paragraph
] as const
