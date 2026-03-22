import { Stream } from 'effect';
import zlib from 'zlib';
import { AppError } from '../../base-error.js';
import { throughNodeStreamScoped } from '../nodeStream.js';
import { IOError } from '../../errors.js';

export const gzip =
  <E extends AppError, R = never>() =>
  (
    stream: Stream.Stream<Uint8Array, E, R>,
  ): Stream.Stream<Uint8Array, E | IOError, R> =>
    stream.pipe(throughNodeStreamScoped(() => zlib.createGzip()));

export const gunzip =
  <E extends AppError, R = never>() =>
  (
    stream: Stream.Stream<Uint8Array, E, R>,
  ): Stream.Stream<Uint8Array, E | IOError, R> =>
    stream.pipe(throughNodeStreamScoped(() => zlib.createGunzip()));
