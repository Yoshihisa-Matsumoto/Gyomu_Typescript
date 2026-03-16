// import { describe, it, expect, vi, beforeEach } from 'vitest';
// import { PassThrough } from 'node:stream';
// import { Stream, Effect, Exit, Cause, Option } from 'effect';
// import { FileService } from '../../services/fileService.js';
// import { FileLive } from '../../layers/fileLive.js';
// import { platform } from '../../../../platform/index.js';
// import { IOError } from '../../../../errors.js';

// // a small helper to run a simple open/collect program
// const collectFromPath = (path: string) =>
//   Effect.flatMap(FileService, (fs) =>
//     fs.open(path).pipe(
//       Stream.runForEach(() =>
//         Effect.sync(() => {
//           // no-op, caller will capture by side effect
//         }),
//       ),
//     ),
//   ).pipe(Effect.provide(FileLive));

// describe('FileLive', () => {
//   beforeEach(() => {
//     vi.clearAllMocks();
//   });

//   it('emits buffers and cleans up listeners/destroys stream', async () => {
//     const pass = new PassThrough();
//     const destroySpy = vi.spyOn(pass, 'destroy');
//     const offSpy = vi.spyOn(pass, 'off');

//     vi.spyOn(platform, 'createReadStream').mockReturnValue(pass as any);

//     const results: string[] = [];
//     const prog = Effect.flatMap(FileService, (fs) =>
//       fs.open('ignored').pipe(
//         Stream.runForEach((chunk) =>
//           Effect.sync(() => {
//             const str =
//               typeof chunk === 'string'
//                 ? chunk
//                 : Buffer.isBuffer(chunk)
//                   ? chunk.toString('utf-8')
//                   : new TextDecoder().decode(chunk);

//             results.push(str);
//           }),
//         ),
//       ),
//     ).pipe(Effect.provide(FileLive));

//     const promise = Effect.runPromise(Effect.scoped(prog));

//     // push some data after the stream is hooked up
//     pass.write('hello');
//     pass.write(Buffer.from('world'));
//     pass.end();

//     await promise;

//     expect(results).toEqual(['hello', 'world']);
//     expect(offSpy).toHaveBeenCalledWith('data', expect.any(Function));
//     expect(offSpy).toHaveBeenCalledWith('end', expect.any(Function));
//     expect(offSpy).toHaveBeenCalledWith('error', expect.any(Function));
//     expect(destroySpy).toHaveBeenCalled();
//   });

//   it('propagates error emitted by stream', async () => {
//     const pass = new PassThrough();
//     vi.spyOn(platform, 'createReadStream').mockReturnValue(pass as any);

//     const prog = collectFromPath('any');
//     const run = Effect.runPromiseExit(Effect.scoped(prog));
//     await new Promise(process.nextTick);
//     pass.emit('error', new Error('stream fail'));

//     const exit = await run;

//     expect(Exit.isFailure(exit)).toBe(true);

//     if (Exit.isFailure(exit)) {
//       const err = Option.getOrThrow(Cause.failureOption(exit.cause));

//       expect(err).toBeDefined();
//       expect(err).toBeInstanceOf(IOError);
//     }
//   });

//   it('fails when createReadStream throws', async () => {
//     vi.spyOn(platform, 'createReadStream').mockImplementation(() => {
//       throw new Error('creation failed');
//     });

//     const prog = collectFromPath('path');
//     await expect(Effect.runPromise(Effect.scoped(prog))).rejects.toThrow(
//       'creation failed',
//     );
//   });
// });
