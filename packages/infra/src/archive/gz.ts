import zlib from 'node:zlib'
import { throughNodeStreamScoped } from '../stream/bridge/nodeStream.js'
import type { Stream } from 'effect'
import type { IOError } from '@gyomu/schema'

/**
 * Compresses a byte stream using gzip.
 *
 * @param stream The input byte stream to compress.
 *
 * @returns A gzipped byte stream.
 */
export const gzip =
  <R = never>() =>
  (stream: Stream.Stream<Uint8Array, IOError, R>): Stream.Stream<Uint8Array, IOError, R> =>
    stream.pipe(throughNodeStreamScoped(() => zlib.createGzip()))

/**
 * Decompresses a gzipped byte stream.
 *
 * @param stream The input gzipped byte stream to decompress.
 *
 * @returns The decompressed byte stream.
 */
export const gunzip =
  <R = never>() =>
  (stream: Stream.Stream<Uint8Array, IOError, R>): Stream.Stream<Uint8Array, IOError, R> =>
    stream.pipe(throughNodeStreamScoped(() => zlib.createGunzip()))
