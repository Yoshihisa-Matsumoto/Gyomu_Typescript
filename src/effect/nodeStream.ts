import { Stream, Effect } from './index';
import { Duplex, Transform } from 'node:stream';
import { IOError, unknownError } from '../errors';
import { AppError } from '../base-error';

export const acquireNodeStream = <T extends Duplex>(create: () => T) =>
  Effect.acquireRelease(Effect.sync(create), (stream) =>
    Effect.sync(() => stream.destroy()),
  );

export const throughNodeStream =
  <A, B, E extends AppError = never>(duplex: Duplex) =>
  (input: Stream.Stream<A, E>): Stream.Stream<B, E | IOError> =>
    Stream.asyncScoped<B, E | IOError>((emit) =>
      Effect.gen(function* () {
        const onData = (chunk: unknown) => {
          emit.single(chunk as B);
        };

        const onEnd = () => {
          emit.end();
        };

        const onError = (err: unknown) => {
          emit.fail(unknownError(IOError, err, 'transform error'));
          duplex.destroy(err as Error);
        };

        duplex.on('data', onData);
        duplex.on('end', onEnd);
        duplex.on('error', onError);

        yield* Effect.addFinalizer(() =>
          Effect.sync(() => {
            duplex.off('data', onData);
            duplex.off('end', onEnd);
            duplex.off('error', onError);
            duplex.destroy();
          }),
        );

        const writableObjectMode =
          (duplex as any)._writableState?.objectMode ?? false;
        const writeChunk = (chunk: A) =>
          Effect.async<void, never>((resume) => {
            if (duplex.destroyed) {
              resume(Effect.void);
              return;
            }

            const value = writableObjectMode
              ? chunk
              : typeof chunk === 'string'
                ? chunk
                : Buffer.from(String(chunk));

            const ok = duplex.write(value);

            if (ok) {
              resume(Effect.void);
            } else {
              duplex.once('drain', () => resume(Effect.void));
            }
          });

        yield* Effect.forkDaemon(
          Stream.runForEach(input, writeChunk).pipe(
            Effect.tap(() => Effect.sync(() => duplex.end())),
          ),
        );
      }),
    );

export const throughNodeStreamScoped =
  <A, B, E extends AppError = never>(create: () => Transform) =>
  (input: Stream.Stream<A, E>) =>
    Stream.unwrapScoped(
      Effect.map(acquireNodeStream(create), (t) =>
        throughNodeStream<A, B, E>(t)(input),
      ),
    );
