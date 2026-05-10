// infrastructure/layer.ts などに定義
import { NodeFileSystem } from '@effect/platform-node'
import { Layer, Logger, References } from 'effect'
import { effectLogger } from '@gyomu/core'
import { fsConstants } from './fs/index.js'

// プロジェクトで使う標準セットをマージする
export const PlatformLayer = process.versions.bun
  ? NodeFileSystem.layer // そのままでもOK
  : NodeFileSystem.layer

// export const MainLayer = Layer.mergeAll(PlatformLayer);

export const MainLayer = Layer.mergeAll(
  Logger.layer([effectLogger], { mergeWithExisting: false }),
  Layer.succeed(References.MinimumLogLevel, 'All'),
)
// .pipe(Layer.provide(NodeFileSystem.layer));
export const FileModes = fsConstants
