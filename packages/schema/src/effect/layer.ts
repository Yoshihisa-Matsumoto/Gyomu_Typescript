import type { Layer } from 'effect'

export const asLayer = <ROut, E, RIn>(
  layer: Layer.Layer<ROut, E, RIn>,
): Layer.Layer<ROut, E, RIn> => layer
