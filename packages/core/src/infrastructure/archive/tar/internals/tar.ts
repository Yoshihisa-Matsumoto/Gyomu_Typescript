import * as tar from 'tar-stream';
import { create } from 'tar';
import { Effect, Stream, Queue, Option } from 'effect';
import { NodeStream } from '@effect/platform-node';
import { IOError } from '../../../../errors.js';
import { unknownError, AppError } from '@gyomu/shared';
import type { Readable } from 'node:stream';
import { runSync } from 'effect/Effect';

import { FileSystem } from 'effect';
//import { fs } from '../../../fs/index.js';
import { FileTransportInfo } from '../../../../gyomu/file/transport.js';
import { ArchiveEntryItem } from '../../common.js';
import { unknown } from 'effect/SchemaAST';
import { platform } from '../../../fs/index.js';
import { makeDirectory, writeStreamToFile } from '../../../fs/fs-utils.js';

type TarEntryItem = Extract<ArchiveEntryItem, { _tag: 'tar' }>;
/**
 * 指定されたディレクトリの内容を tar (または tar.gz) アーカイブとして作成する
 */
export const createTar = <R = never>(options: {
  tarFileName: string;
  cwd: string;
  gzip?: boolean;
}): Effect.Effect<boolean, IOError, R> =>
  Effect.tryPromise({
    try: () =>
      create(
        {
          file: options.tarFileName,
          cwd: options.cwd,
          gzip: options.gzip ?? false,
        },
        [''], // cwd 配下のすべてを対象とする
      ),
    catch: (err) => new IOError('Fail to Tar archive', err as Error),
  }).pipe(
    // 戻り値を boolean (true) に合わせる場合
    Effect.as(true),
  );

// type TarEntry = {
//   //readonly header: tar.Headers;
//   path: string;
//   isDirectory: boolean;
//   readonly stream: Stream.Stream<Uint8Array, AppError>;
// };

export const untar = <E extends AppError, R = never>(
  source: Stream.Stream<Uint8Array, E, R>,
): Stream.Stream<TarEntryItem, E | IOError, R> =>
  Stream.scoped(
    Stream.unwrap(
      Effect.gen(function* () {
        const extract = tar.extract();

        // 1. Source を Extract に流し込む (Scoped Fiber)
        const nodeReadable = yield* NodeStream.toReadable(source);
        yield* Effect.promise(
          () =>
            new Promise<void>((resolve, reject) => {
              nodeReadable.pipe(extract);
              extract.on('finish', resolve);
              extract.on('error', reject);
            }),
        ).pipe(
          Effect.catch((e) => Effect.logError('Tar Pipeline Error', e)),
          Effect.forkScoped,
        );

        // 2. Stream.callback による実装
        // emit は Queue<Take<TarEntry, AppError>> のような挙動をする Queue です
        return Stream.callback<TarEntryItem, E, R>((queue) => {
          extract.on('entry', (header, stream, next) => {
            // next() を確実に呼ぶためのフラグ
            let nextCalled = false;
            const safeNext = () => {
              if (!nextCalled) {
                nextCalled = true;
                next();
              }
            };
            // Stream.acquireRelease の代わり: Stream.scoped + Effect.acquireRelease
            const content = Stream.unwrap(
              Effect.acquireRelease(Effect.succeed(stream as Readable), () =>
                Effect.sync(() => safeNext()),
              ).pipe(
                Effect.map((s) =>
                  NodeStream.fromReadable<Uint8Array, AppError>({
                    evaluate: () => s,
                    onError: (e) =>
                      unknownError(IOError, e, `Read error: ${header.name}`),
                  }),
                ),
              ),
            );

            // @effect-diagnostics-next-line floatingEffect:off
            content.pipe(Stream.ensuring(Effect.sync(() => safeNext())));

            // Queue.offer を使ってデータを流す (single の代わり)
            // Stream.callback の emit は Effect を返す関数ではなく直接 Queue.offer 的な挙動
            const entry: TarEntryItem =
              header.type == 'file'
                ? {
                    _tag: 'tar',
                    path: header.name,
                    isDirectory: false,
                    openStream: () => content,
                    uncompressedSize: header.size!,
                  }
                : {
                    _tag: 'tar',
                    path: header.name,
                    isDirectory: true,
                    openStream: () => content,
                  };
            runSync(Queue.offer(queue, entry));
          });

          extract.on('finish', () => {
            runSync(Queue.end(queue)); // エンド信号 (None/undefined で終了)
          });

          extract.on('error', (err) => {
            runSync(
              Queue.fail(queue, unknownError(IOError, err, 'Tar Error') as E),
            );
          });
          return Effect.void;
        });
      }),
    ),
  );

export const existsInTar =
  (entryName: string) =>
  <E extends AppError, R = never>(
    self: Stream.Stream<Uint8Array, E, R>,
  ): Effect.Effect<boolean, AppError, R> =>
    self.pipe(
      untar,
      filterEntries((h) => h.path === massageEntryPath(entryName)),
      Stream.runHead,
      Effect.flatMap((option) =>
        Option.match(option, {
          // 見つからなかった場合
          onNone: () => Effect.succeed(false),
          // 見つかった場合、そのエントリの content を空読みしてストリームを正常終了させる
          onSome: (entry) =>
            Stream.runDrain(entry.openStream()).pipe(Effect.as(true)),
        }),
      ),
    );

/**
 * TarEntry の content をすべて読み込み、文字列として返す Effect を生成する
 */
export const readTextEntry = <R = never>(
  entry: TarEntryItem,
): Effect.Effect<string, AppError, R> =>
  readEntry(entry).pipe(
    Effect.map((chunks) => Buffer.concat(chunks).toString('utf8')),
  );
export const readEntry = <R = never>(
  entry: TarEntryItem,
): Effect.Effect<Uint8Array<ArrayBufferLike>[], AppError, R> =>
  Stream.runCollect(entry.openStream());

export const readEntryStream = <R = never>(
  entry: TarEntryItem,
): Stream.Stream<Uint8Array<ArrayBufferLike>, AppError, R> =>
  entry.openStream();

const massageEntryPath = (fileName: string) => {
  return fileName ? fileName.replace(/\\/g, '/') : fileName;
};
/**
 * ライブラリ利用者が楽をするためのヘルパー
 * 条件に合わないエントリを自動で Drain し、デッドロックを防ぐ
 */
export const filterEntries =
  <E extends AppError = never, R = never>(
    predicate: (entry: TarEntryItem) => boolean,
  ) =>
  (
    self: Stream.Stream<TarEntryItem, E, R>,
  ): Stream.Stream<TarEntryItem, AppError | E, R> =>
    self.pipe(
      Stream.mapEffect((entry) =>
        predicate(entry)
          ? Effect.succeed(Option.some(entry))
          : Stream.runDrain(entry.openStream()).pipe(Effect.as(Option.none())),
      ),
      Stream.flatMap((opt) =>
        Option.match(opt, {
          onNone: () => Stream.empty,
          onSome: (v) => Stream.make(v),
        }),
      ),
    );
/**
 * 特定のファイルを 1 つだけ取得し、見つからなければエラーにする
 */
export const requireEntry =
  (entryName: string) =>
  <E extends AppError, R = never>(self: Stream.Stream<TarEntryItem, E, R>) =>
    self.pipe(
      // 1. フィルタリング（内部で Drain 済み）
      filterEntries((h) => h.path === massageEntryPath(entryName)),
      // 2. 最初の 1 つを取る
      Stream.runHead,
      // 3. Option を剥がして、None なら Fail させる
      Effect.flatMap(
        Option.match({
          onNone: () =>
            Effect.fail(new IOError(`File not found: ${entryName}`)),
          onSome: (entry) => Effect.succeed(entry),
        }),
      ),
    );
export const extractTarAll =
  (destinationDirectory: string) =>
  <E extends AppError, R = never>(
    self: Stream.Stream<Uint8Array<ArrayBufferLike>, E, R>,
  ): Effect.Effect<void, IOError | E, FileSystem.FileSystem | R> =>
    extractTarToDirectory({ targetDir: destinationDirectory })(self);

/**
 * tar ストリームを指定したディレクトリに展開する。
 * @param options.targetDir 展開先のベースディレクトリ
 * @param options.stripPath このパス配下のファイルのみを対象とし、展開時にこのパスプレフィックスを削除する
 */
export const extractTarToDirectory =
  (options: { targetDir: string; stripPath?: string }) =>
  <E extends AppError, R = never>(
    self: Stream.Stream<Uint8Array<ArrayBufferLike>, E, R>,
  ): Effect.Effect<void, IOError | E, FileSystem.FileSystem | R> =>
    Effect.gen(function* () {
      const { targetDir, stripPath = '' } = options;

      return yield* self.pipe(
        untar,
        // 1. stripPath でフィルタリング
        filterEntries((entry) =>
          entry.path.startsWith(massageEntryPath(stripPath)),
        ),
        // 2. 各エントリをファイルとして書き出す
        Stream.runForEach((entry) =>
          Effect.gen(function* () {
            // 相対パスの計算 (stripPath 分を削る)
            const relativePath = stripPath
              ? entry.path.slice(stripPath.length).replace(/^[/\\]+/, '')
              : entry.path;

            if (!relativePath)
              return yield* Stream.runDrain(entry.openStream()); // プレフィックス自体はスキップ

            const fullPath = platform.join(targetDir, relativePath);

            // ディレクトリの場合は作成して終了
            if (entry.isDirectory) {
              yield* makeDirectory(fullPath);
              return yield* Stream.runDrain(entry.openStream()).pipe(
                Effect.mapError((e) =>
                  unknownError(IOError, e, `Fail to save file`),
                ),
              );
            }

            // ファイルの場合は親ディレクトリを作ってから書き込み
            yield* makeDirectory(platform.dirname(fullPath));
            yield* Effect.logDebug(`Untar ${fullPath}`);
            // entry.content (Stream) をファイルに流し込む
            // sinkUnique などを使って効率的に書き込む
            return yield* writeStreamToFile(fullPath)(entry.openStream());
          }),
        ),
        Effect.mapError((e) => unknownError(IOError, e, `Fail to save file`)),
      );
    });

export const extractTarSingleFile =
  (sourceEntryFullName: string, destinationFolderName: string) =>
  <E extends AppError, R = never>(
    self: Stream.Stream<Uint8Array<ArrayBufferLike>, E, R>,
  ): Effect.Effect<void, AppError | IOError | E, FileSystem.FileSystem | R> =>
    Effect.gen(function* () {
      const entry = yield* self.pipe(
        untar,
        // 1. stripPath でフィルタリング
        requireEntry(sourceEntryFullName),
      );
      if (entry.isDirectory) {
        return yield* Effect.fail(
          new IOError(`${sourceEntryFullName} is a directory`),
        );
      }
      // 相対パスの計算 (stripPath 分を削る)
      const fileName = platform.basename(sourceEntryFullName);

      const fullPath = platform.join(destinationFolderName, fileName);

      // ファイルの場合は親ディレクトリを作ってから書き込み
      yield* makeDirectory(platform.dirname(fullPath));
      yield* Effect.logDebug(`Untar ${fullPath}`);
      // entry.stream (Stream) をファイルに流し込む
      // sinkUnique などを使って効率的に書き込む
      return yield* writeStreamToFile(fullPath)(entry.openStream());
    });

export const extractTar =
  <E extends AppError, R = never>(transferInformation: FileTransportInfo) =>
  (
    self: Stream.Stream<Uint8Array<ArrayBufferLike>, E, R>,
  ): Effect.Effect<void, AppError | E, FileSystem.FileSystem | R> =>
    Effect.gen(function* () {
      if (
        transferInformation.sourceFileName !==
        transferInformation.destinationFileName
      )
        return yield* Effect.fail(
          new IOError('Destination filename must be same as original filename'),
        );
      if (!transferInformation.isSourceDirectory) {
        return yield* extractTarSingleFile(
          transferInformation.sourceFullName,
          transferInformation.destinationPath,
        )(self);
      } else {
        return yield* extractTarToDirectory({
          targetDir: transferInformation.destinationFullName,
          stripPath: transferInformation.sourceFullName,
        })(self);
      }
    });
