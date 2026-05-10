import path from 'node:path'
import { tmpdir } from 'node:os'
import { beforeAll, expect, test } from 'vitest'
import { Effect, Layer } from 'effect'
import { gunzip, gzip } from '../gz.js'
import { copyFolder, emptyDir, fileStream, writeStreamToFile } from '../../fs/fs-utils.js'
import { compareFiles } from '../../__tests__/baseClass.js'
import { makeRunner } from '../../runtime.js'
import { MainLayer, PlatformLayer } from '../../layer.js'

const nodeTestLayer = Layer.mergeAll(MainLayer, PlatformLayer)
const runNodeWithEnvOrThrow = makeRunner(nodeTestLayer)

let compressDirectory: string
let extractDirectory: string
beforeAll(async () => {
  const tmpPath = tmpdir()
  const sourceDirectory = path.resolve('./tests')
  const destinationDirectory = path.join(tmpPath, 'compressGz')
  await runNodeWithEnvOrThrow(
    Effect.gen(function* () {
      yield* emptyDir(destinationDirectory)
      yield* copyFolder(sourceDirectory, destinationDirectory)
      compressDirectory = destinationDirectory
      extractDirectory = path.join(destinationDirectory, 'extract')
      yield* emptyDir(extractDirectory)
    }),
  )
})

test('GZ Creation Test', async () => {
  // const extractDirectory = path.join(compressDirectory,'extracted');
  const sourceDirectory = path.join(compressDirectory, 'source')
  const gzFilename = path.join(compressDirectory, 'test_gz_create.gz')
  const targetSourceFilename = path.join(sourceDirectory, 'README.md')

  await runNodeWithEnvOrThrow(
    fileStream(targetSourceFilename).pipe(gzip(), writeStreamToFile(gzFilename)),
  )
  // expect(result.isOk()).toBeTruthy();

  // let isSame
  // let isSame = compareFiles(
  //   gzFilename,
  //   path.join(compressDirectory, 'compress/README.md.gz')
  // );
  // expect(isSame).toBeTruthy();

  // const checkFilename = path.join(sourceDirectory, 'README.md');
  // //const [sourceBuffer,destinationBuffer] = getBufferG
  const extractedFilename = path.join(extractDirectory, 'README.md')
  await runNodeWithEnvOrThrow(
    fileStream(gzFilename).pipe(gunzip(), writeStreamToFile(extractedFilename)),
  )

  const isSame = await compareFiles(extractedFilename, path.join(sourceDirectory, 'README.md'))
  expect(isSame).toBeTruthy()
})
