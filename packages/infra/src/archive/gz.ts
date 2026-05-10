import zlib from 'node:zlib'
import { throughNodeStreamScoped } from '../stream/bridge/nodeStream.js'
import type { Stream } from 'effect'
import type { IOError } from '@gyomu/core'

export const gzip =
  <R = never>() =>
  (stream: Stream.Stream<Uint8Array, IOError, R>): Stream.Stream<Uint8Array, IOError, R> =>
    stream.pipe(throughNodeStreamScoped(() => zlib.createGzip()))

export const gunzip =
  <R = never>() =>
  (stream: Stream.Stream<Uint8Array, IOError, R>): Stream.Stream<Uint8Array, IOError, R> =>
    stream.pipe(throughNodeStreamScoped(() => zlib.createGunzip()))
