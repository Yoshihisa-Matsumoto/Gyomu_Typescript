import { Brand } from 'effect'

export type ModelRouteId = Brand.Branded<string, 'ModelRouteId'>

export const ModelRouteId = Brand.nominal<ModelRouteId>()
