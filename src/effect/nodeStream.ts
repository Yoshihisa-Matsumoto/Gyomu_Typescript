import { Stream, Effect, Fiber, Queue } from 'effect';
import { Duplex, Transform } from 'node:stream';
import { IOError, unknownError } from '../errors.js';
import { AppError } from '../base-error.js';
import { runSync } from 'effect/Effect';

export const acquireNodeStream = <T extends Duplex>(create: () => T) =>
  Effect.acquireRelease(Effect.sync(create), (stream) =>
    Effect.sync(() => stream.destroy()),
  );

export const throughNodeStream =
  <I, O>(duplex: Duplex) =>
  <E, R>(input: Stream.Stream<I, E, R>): Stream.Stream<O, E | IOError, R> =>
    Stream.unwrap(
      Effect.gen(function* () {
        const writer = yield* Stream.runForEach(input, (chunk) =>
          Effect.promise<void>(
            () =>
              new Promise((resolve) => {
                const ok = duplex.write(chunk as any);

                if (ok) resolve();
                else {
                  duplex.once('drain', resolve);
                }
              }),
          ),
        ).pipe(
          Effect.tap(() =>
            Effect.sync(() => {
              duplex.end();
            }),
          ),
          Effect.forkChild,
        );

        const readable = duplex as AsyncIterable<O>;

        return Stream.fromAsyncIterable<O, IOError>(readable, (e) =>
          unknownError(IOError, e, 'node stream error'),
        ).pipe(
          Stream.ensuring(
            Effect.gen(function* () {
              yield* Fiber.interrupt(writer);
              if (!duplex.destroyed) {
                duplex.destroy();
              }
            }),
          ),
        );
      }),
    );

// const HIGH_WATER_MARK = 100;
// const LOW_WATER_MARK = 50;
// export const throughNodeStreamWithCallback =
//   <I, O>(duplex: Duplex) =>
//   <E, R>(input: Stream.Stream<I, E, R>): Stream.Stream<O, E | IOError, R> =>
//     Stream.callback<O, E | IOError, R>((queue) => {
//       const resumeWatcher = Effect.gen(function* () {
//         while (true) {
//           // Queueに空きが出るのを待つ、あるいは定期的にサイズをチェックする
//           yield* Effect.sleep('10 millis');
//           const size = yield* Queue.size(queue);
//           if (duplex.isPaused() && size <= LOW_WATER_MARK) {
//             console.log('resume');
//             duplex.resume();
//           }
//         }
//       }).pipe(Effect.forkChild); // バックグラウンドで監視
//       const onData = (chunk: unknown) => {
//         console.log('data');
//         const size = Effect.runSync(Queue.size(queue));
//         if (size > HIGH_WATER_MARK) {
//           console.log('pause');
//           duplex.pause();
//         }
//         Effect.runFork(Queue.offer(queue, chunk as O));
//       };

//       const onEnd = () => Effect.runSync(Queue.end(queue)); //emit.end();

//       const onError = (err: unknown) => {
//         Effect.runSync(
//           Queue.failCause(
//             queue,
//             Cause.fail(unknownError(IOError, err, 'node stream error')),
//           ),
//         );
//       };

//       duplex.on('data', onData);
//       duplex.on('end', onEnd);
//       duplex.on('error', onError);

//       const writer = Stream.runForEach(input, (chunk) =>
//         Effect.promise<void>(
//           () =>
//             new Promise((resolve, reject) => {
//               console.log('writing');
//               const ok = duplex.write(chunk as any);

//               if (ok) resolve();
//               else duplex.once('drain', resolve);

//               duplex.once('error', reject);
//             }),
//         ),
//       ).pipe(
//         Effect.tap(() =>
//           Effect.sync(() => {
//             if (!duplex.destroyed) duplex.end();
//           }),
//         ),
//       );

//       const watcherFiber = Effect.runSync(resumeWatcher);

//       const fiber = Effect.runFork(writer as Effect.Effect<void, E, never>);

//       return Effect.gen(function* () {
//         duplex.off('data', onData);
//         duplex.off('end', onEnd);
//         duplex.off('error', onError);

//         yield* Fiber.interrupt(fiber);
//         yield* Fiber.interrupt(watcherFiber);
//         if (!duplex.destroyed) duplex.destroy();
//       });
//     });
/**
 * Connects a Node.js Transform stream to an Effect Stream.
 *
 * IMPORTANT:
 * - This function accepts only Transform (not generic Duplex).
 * - Transform represents a true "I -> O" data transformation,
 *   which matches Stream.pipe semantics.
 *
 * Why not Duplex?
 * - Duplex is more general (e.g. sockets) and does not guarantee transformation.
 * - Allowing Duplex would weaken type safety and may introduce incorrect usage.
 *
 * Note:
 * - Readable (source) streams are NOT handled here.
 *   They must be converted separately (e.g. via Effect + Stream.async).
 */
export const throughNodeStreamScoped =
  <I, O>(create: () => Transform) =>
  <E extends AppError = never, R = never>(
    input: Stream.Stream<I, E, R>,
  ): Stream.Stream<O, E | IOError, R> =>
    Stream.unwrap(
      Effect.map(acquireNodeStream(create), (t) =>
        throughNodeStream<I, O>(t)<E, R>(input),
      ),
    );
export const throughNodeStreamScoped_original =
  <I, O, E extends AppError = never, R = never>(create: () => Transform) =>
  (input: Stream.Stream<I, E, R>) =>
    Stream.unwrap(
      Effect.map(acquireNodeStream(create), (t) =>
        throughNodeStream<I, O>(t)<E, R>(input),
      ),
    );

export const fromReadable = (readable: NodeJS.ReadableStream) =>
  Stream.callback<Uint8Array, IOError>((queue) =>
    Effect.acquireRelease(
      Effect.sync(() => {
        const onData = (chunk: Uint8Array) => {
          runSync(Queue.offer(queue, chunk));
        };
        const onEnd = () => {
          runSync(Queue.end(queue));
        };
        const onError = (err: unknown) => {
          runSync(Queue.fail(queue, unknownError(IOError, err, 'Tar Error')));
        };

        readable.on('data', onData);
        readable.on('end', onEnd);
        readable.on('error', onError);

        return { onData, onEnd, onError };
      }),
      ({ onData, onEnd, onError }) =>
        Effect.sync(() => {
          readable.off('data', onData);
          readable.off('end', onEnd);
          readable.off('error', onError);
        }),
    ),
  );

export const fromNodeCallback = <A>(
  f: (cb: (err: Error | null, result?: A) => void) => void,
) =>
  Effect.callback<A, IOError>((resume) => {
    f((err, result) => {
      if (err || result == null) {
        resume(Effect.fail(new IOError(err?.message ?? 'callback failed')));
      } else {
        resume(Effect.succeed(result));
      }
    });
  });
