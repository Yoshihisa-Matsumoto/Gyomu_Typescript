import { Effect, Layer } from '../..';
import { platform } from '../../../platform';
import { FileService } from '../services/fileService';

export const FileLive = Layer.succeed(FileService, {
  open: (path: string) =>
    Effect.acquireRelease(
      Effect.sync(() => platform.createReadStream(path)),
      (stream) => Effect.sync(() => stream.destroy()),
    ),
});
