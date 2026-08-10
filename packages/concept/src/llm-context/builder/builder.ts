import { buildOverview } from './sections/buildOverview.js'
import { buildPackageResponsibilities } from './sections/buildPackageResponsibilities.js'
import { buildArchitecture } from './sections/buildArchitecture.js'
import { buildImportantConstraints } from './sections/buildImportantConstraints.js'
import { buildNavigation } from './sections/buildNavigation.js'
import { buildEditingRules } from './sections/buildEditingRules.js'
import { buildDesignPrinciples } from './sections/buildDesignPrinciples.js'
import type { LlmContextBuildContext, LlmContextSectionId } from '@gyomu/schema/concept'
import type { SectionBuilder } from '../../document/builder/SectionBuilder.js'

/**
 * An array of builder functions used to construct sections of the README document.
 */
export const LLMCONTEXT_SECTION_BUILDERS: ReadonlyArray<
  SectionBuilder<LlmContextSectionId, LlmContextBuildContext, any>
> = [
  buildOverview, // paragraph + AI
  buildPackageResponsibilities, // bullet-list
  buildArchitecture, // paragraph + AI
  buildDesignPrinciples, // bullet-list + AI buildSectionObject
  buildImportantConstraints, // paragraph + AI
  buildEditingRules, // bullet-list + AI buildSectionObject
  buildNavigation, // paragraph
] as const
