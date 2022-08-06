import { FileTransportInfo } from '../fileModel';

import fs from 'fs';
import path, { resolve } from 'path';
import { ArchiveError } from '../errors';
import { fail, Result, success, PromiseResult, Failure } from '../result';
import archiver from 'archiver';

export class TarArchive {
  static async create(
    tarFileName: string,
    transferInformationList: FileTransportInfo[]
  ): Promise<Result<boolean, ArchiveError>> {
    const archive = archiver.create('tar');

    //outputStream.on('close',()=>)
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.log(err.message);
      } else {
        return new Failure(
          new ArchiveError('Unknown Warning on Tar Archive', err)
        );
      }
    });
    archive.on('error', (err) => {
      return new Failure(new ArchiveError('Unknown Error on Tar Archive', err));
    });
    const outputStream = fs.createWriteStream(tarFileName);
    archive.pipe(outputStream);

    for (const transferInformation of transferInformationList) {
      const sourcePath = transferInformation.sourceFullNameWithBasePath;
      if (!fs.existsSync(sourcePath))
        return fail(`File Not Found: ${sourcePath}`, ArchiveError);
      if (!transferInformation.isSourceDirectory) {
        let destinationEntryName =
          transferInformation.destinationFullName.replace(path.sep, '/');
        archive.file(sourcePath, { name: destinationEntryName });
      } else {
        archive.directory(
          sourcePath,
          transferInformation.destinationPath
            ? transferInformation.destinationPath
            : false
        );
        //this.#buildZipArchiveInternal(sourcePath, sourcePath, archive);
      }
    }
    await archive.finalize();
    return success(true);
  }
}
