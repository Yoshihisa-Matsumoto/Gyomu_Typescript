import type { Layer } from 'effect'

/**
 * Casts a layer to the provided type, serving as an identity function for type narrowing.
 *
 * @param layer The layer to cast.
 *
 * @returns The input layer.
 */
export const asLayer = <ROut, E, RIn>(
  layer: Layer.Layer<ROut, E, RIn>,
): Layer.Layer<ROut, E, RIn> => layer
