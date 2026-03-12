import { Effect, Layer, Stream } from '../..';
import { IOError, unknownError } from '../../../errors';
import { platform } from '../../../platform';
import { FileService } from '../services/fileService';

export const FileLive = Layer.succeed(FileService, {
  open: (path: string) =>
    Stream.acquireRelease(
      Effect.sync(() => platform.createReadStream(path)),
      (stream) => Effect.sync(() => stream.destroy()),
    ).pipe(
      Stream.flatMap((rs) =>
        Stream.async<Buffer, IOError>((emit) => {
          const onData = (chunk: string | Buffer) => {
            if (Buffer.isBuffer(chunk)) {
              emit.single(chunk);
            } else {
              emit.single(Buffer.from(chunk));
            }
          };
          const onEnd = () => emit.end();
          const onError = (e: unknown) =>
            emit.fail(unknownError(IOError, e, 'read file error'));

          rs.on('data', onData);
          rs.on('end', onEnd);
          rs.on('error', onError);

          return Effect.sync(() => {
            rs.off('data', onData);
            rs.off('end', onEnd);
            rs.off('error', onError);
          });
        }),
      ),
    ),
});
