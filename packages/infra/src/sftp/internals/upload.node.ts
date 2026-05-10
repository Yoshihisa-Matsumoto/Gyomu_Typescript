import { NetworkError, isRetryableNetworkError } from '@gyomu/core'
import { Effect } from 'effect'
import { NodeStream } from '@effect/platform-node'
import { withSftp } from './shared.js'
import type { Writable } from 'node:stream'
import type { Client } from 'ssh2'
import type { IOError } from '@gyomu/core'
import type { Stream } from 'effect'

export const uploadFromStreamUnderNodejs =
  (client: Client) =>
  <R>(
    source: Stream.Stream<Uint8Array, IOError, R>,
    remotePath: string,
  ): Effect.Effect<void, NetworkError, R> =>
    withSftp(client)((sftp) =>
      Effect.scoped(
        Effect.gen(function* () {
          const readableStream = yield* NodeStream.toReadable(source)

          const writableStream = yield* Effect.callback<Writable, NetworkError>((resume) => {
            try {
              const ws = sftp.createWriteStream(remotePath)

              const onOpen = () => {
                cleanup()
                resume(Effect.succeed(ws))
              }

              const onError = (err: Error) => {
                cleanup()
                resume(
                  Effect.fail(
                    new NetworkError({
                      message: `Fail to open remote file`,
                      cause: err,
                      retryable: isRetryableNetworkError(err),
                      operation: 'upload',
                      endpoint: remotePath,
                    }),
                  ),
                )
              }

              const cleanup = () => {
                ws.off('open', onOpen)
                ws.off('error', onError)
              }

              ws.on('open', onOpen)
              ws.on('error', onError)
            } catch (e) {
              resume(
                Effect.fail(
                  new NetworkError({
                    message: 'fail to create write stream',
                    cause: e,
                    operation: 'upload',
                    retryable: isRetryableNetworkError(e),
                    endpoint: remotePath,
                  }),
                ),
              )
            }
          })

          // 🔥 ここが重要
          yield* Effect.acquireRelease(
            Effect.sync(() => {
              readableStream.pipe(writableStream)
              return { readable: readableStream, writable: writableStream }
            }),
            ({ readable, writable }) =>
              Effect.sync(() => {
                // interrupt時も確実に閉じる
                readable.destroy()
                writable.destroy()
              }),
          ).pipe(
            Effect.flatMap(() =>
              Effect.callback<void, NetworkError>((resume) => {
                const onFinish = () => {
                  cleanup()
                  resume(Effect.succeed(undefined))
                }

                const onError = (err: Error) => {
                  cleanup()
                  resume(
                    Effect.fail(
                      new NetworkError({
                        message: 'upload fail',
                        cause: err,
                        operation: 'upload',
                        retryable: isRetryableNetworkError(err),
                        endpoint: remotePath,
                      }),
                    ),
                  )
                }

                const cleanup = () => {
                  readableStream.off('error', onError)
                  writableStream.off('error', onError)
                  writableStream.off('finish', onFinish)
                  writableStream.off('close', onFinish) // 🔥 念のため
                }

                readableStream.on('error', onError)
                writableStream.on('error', onError)
                writableStream.on('finish', onFinish)
                writableStream.on('close', onFinish)

                return Effect.sync(cleanup)
              }),
            ),
          )
        }),
      ),
    )
