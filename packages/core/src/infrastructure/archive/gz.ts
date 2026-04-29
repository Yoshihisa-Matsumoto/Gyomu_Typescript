import { Stream } from 'effect';
import zlib from 'zlib';
import { throughNodeStreamScoped } from '../stream/bridge/nodeStream.js';
import { IOError } from '../../errors.js';

export const gzip =
  <R = never>() =>
  (
    stream: Stream.Stream<Uint8Array, IOError, R>,
  ): Stream.Stream<Uint8Array, IOError, R> =>
    stream.pipe(throughNodeStreamScoped(() => zlib.createGzip()));

export const gunzip =
  <R = never>() =>
  (
    stream: Stream.Stream<Uint8Array, IOError, R>,
  ): Stream.Stream<Uint8Array, IOError, R> =>
    stream.pipe(throughNodeStreamScoped(() => zlib.createGunzip()));
