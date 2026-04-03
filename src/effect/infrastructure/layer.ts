// infrastructure/layer.ts などに定義
import { NodeFileSystem, NodePath } from '@effect/platform-node';
import { Layer, Logger, References } from 'effect';
import { fsConstants } from '../../platform/index.js';
import { effectLogger } from '../logger.js';
import { ConfigProviderLive, ConfigService } from './config.js';
import { KyselyService } from './db/kysely-service.js';

// プロジェクトで使う標準セットをマージする
export const PlatformLayer = Layer.mergeAll(
  NodeFileSystem.layer,
  NodePath.layer,
);
export const ConfigLayer = Layer.mergeAll(
  ConfigProviderLive,
  ConfigService.live,
);

//export const MainLayer = Layer.mergeAll(PlatformLayer);

export const RunEnv = Layer.mergeAll(
  Logger.layer([effectLogger], { mergeWithExisting: false }),
  Layer.succeed(References.MinimumLogLevel, 'All'),
).pipe(Layer.provide(NodeFileSystem.layer));
export const FileModes = fsConstants;

export const DBLayer = Layer.mergeAll(RunEnv, ConfigLayer, KyselyService.live);
