// infrastructure/layer.ts などに定義
import { NodeFileSystem } from '@effect/platform-node'
import { Layer, Logger, References } from 'effect'
import { effectLogger } from '@gyomu/schema'
import { asLayer } from '@gyomu/schema/effect'
import { fsConstants } from './fs/index.js'

// プロジェクトで使う標準セットをマージする

/**
 * Defines a service layer representing the underlying file system platform, compatible with Node.js and Bun environments.
 */
export const PlatformLayer = (
  process.versions.bun
    ? NodeFileSystem.layer // そのままでもOK
    : NodeFileSystem.layer
) satisfies Layer.Layer<never, never, never>
// export const MainLayer = Layer.mergeAll(PlatformLayer);

/**
 * Defines the main application service layer, configuring logging and default log levels.
 */
export const MainLayer = asLayer(
  Layer.mergeAll(
    Logger.layer([effectLogger], { mergeWithExisting: false }),
    Layer.succeed(References.MinimumLogLevel, 'All'),
  ),
)

// .pipe(Layer.provide(NodeFileSystem.layer));

/**
 * Provides access to file system constants for mode and permission configuration.
 */
export const FileModes = fsConstants
