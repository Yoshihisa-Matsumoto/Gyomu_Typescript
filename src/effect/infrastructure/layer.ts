// infrastructure/layer.ts などに定義
import { NodeFileSystem, NodePath } from '@effect/platform-node';
import { Layer, Logger, References } from 'effect';
import { fsConstants } from '../../platform/index.js';
import { effectLogger } from '../logger.js';

// プロジェクトで使う標準セットをマージする
const PlatformLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);

export const MainLayer = Layer.mergeAll(PlatformLayer);

export const RunEnv = Layer.mergeAll(
  MainLayer,

  Logger.layer([effectLogger], { mergeWithExisting: false }),
  Layer.succeed(References.MinimumLogLevel, 'All'),
);
export const FileModes = fsConstants;
