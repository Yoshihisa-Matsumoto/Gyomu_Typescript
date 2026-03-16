import { Stream, Effect, Fiber, Queue, Cause } from 'effect';
import { Duplex, Transform } from 'node:stream';
import { IOError, unknownError } from '../errors.js';
import { AppError } from '../base-error.js';

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

export const throughNodeStream2 =
  <I, O>(duplex: Duplex) =>
  <E, R>(input: Stream.Stream<I, E, R>): Stream.Stream<O, E | IOError, R> =>
    Stream.callback<O, E | IOError, R>((queue) => {
      const onData = (chunk: unknown) => {
        duplex.pause();
        Effect.runFork(Queue.offer(queue, chunk as O));
        Queue.offerUnsafe(queue, chunk as O);
        //emit.single(chunk as O);
        duplex.resume();
      };

      const onEnd = () => Queue.endUnsafe(queue); //emit.end();

      const onError = (err: unknown) => {
        Queue.failCauseUnsafe(
          queue,
          Cause.fail(unknownError(IOError, err, 'node stream error')),
        );
      };

      duplex.on('data', onData);
      duplex.on('end', onEnd);
      duplex.on('error', onError);

      const writer = Stream.runForEach(input, (chunk) =>
        Effect.promise<void>(
          () =>
            new Promise((resolve, reject) => {
              const ok = duplex.write(chunk as any);

              if (ok) resolve();
              else duplex.once('drain', resolve);

              duplex.once('error', reject);
            }),
        ),
      ).pipe(
        Effect.tap(() =>
          Effect.sync(() => {
            if (!duplex.destroyed) duplex.end();
          }),
        ),
      );

      const fiber = Effect.runFork(writer as Effect.Effect<void, E, never>);

      return Effect.gen(function* () {
        duplex.off('data', onData);
        duplex.off('end', onEnd);
        duplex.off('error', onError);

        if (!duplex.destroyed) duplex.destroy();

        yield* Fiber.interrupt(fiber);
      });
    });

export const throughNodeStreamScoped =
  <I, O, E extends AppError = never>(create: () => Transform) =>
  (input: Stream.Stream<I, E>) =>
    Stream.unwrap(
      Effect.map(acquireNodeStream(create), (t) =>
        throughNodeStream<I, O>(t)(input),
      ),
    );
