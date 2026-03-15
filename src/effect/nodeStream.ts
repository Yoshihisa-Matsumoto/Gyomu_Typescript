import { Stream, Effect } from 'effect';
import { Duplex, Transform } from 'node:stream';
import { IOError, unknownError } from '../errors.js';
import { AppError } from '../base-error.js';

export const acquireNodeStream = <T extends Duplex>(create: () => T) =>
  Effect.acquireRelease(Effect.sync(create), (stream) =>
    Effect.sync(() => stream.destroy()),
  );

export const throughNodeStream =
  <I, O, E extends AppError = never>(duplex: Duplex) =>
  <R>(input: Stream.Stream<I, E, R>): Stream.Stream<O, E | IOError, R> =>
    Stream.asyncScoped<O, E | IOError, R>((emit) =>
      Effect.gen(function* () {
        const onData = (chunk: unknown) => {
          duplex.pause();
          emit.single(chunk as O);
          duplex.resume();
        };

        const onEnd = () => {
          emit.end();
        };

        const onClose = () => {
          emit.end();
        };

        const onError = (err: unknown) => {
          emit.fail(unknownError(IOError, err, 'transform error'));
          duplex.destroy(err as Error);
        };

        duplex.on('data', onData);
        duplex.on('end', onEnd);
        duplex.on('close', onClose);
        duplex.on('error', onError);

        yield* Effect.addFinalizer(() =>
          Effect.sync(() => {
            duplex.off('data', onData);
            duplex.off('end', onEnd);
            duplex.off('close', onClose);
            duplex.off('error', onError);
            if (!duplex.destroyed) duplex.destroy();
          }),
        );

        const writableObjectMode =
          (duplex as any)._writableState?.objectMode ?? false;
        const writeChunk = (chunk: I) =>
          Effect.async<void, never>((resume) => {
            if (duplex.destroyed) {
              resume(Effect.void);
              return;
            }

            const value = writableObjectMode
              ? chunk
              : typeof chunk === 'string'
                ? chunk
                : Buffer.isBuffer(chunk)
                  ? chunk
                  : Buffer.from(chunk as any);

            const ok = duplex.write(value);

            if (ok) {
              resume(Effect.void);
            } else {
              duplex.once('drain', () => resume(Effect.void));
            }
          });

        yield* Effect.forkDaemon(
          Stream.runForEach(input, writeChunk).pipe(
            Effect.tap(() =>
              Effect.sync(() => {
                if (!duplex.destroyed) {
                  duplex.end();
                }
              }),
            ),
          ),
        );
      }),
    );

export const throughNodeStreamScoped =
  <I, O, E extends AppError = never>(create: () => Transform) =>
  (input: Stream.Stream<I, E>) =>
    Stream.unwrapScoped(
      Effect.map(acquireNodeStream(create), (t) =>
        throughNodeStream<I, O, E>(t)(input),
      ),
    );
