import ftp from 'basic-ftp';
import { PeerCertificate } from 'tls';
import { NetworkError } from '../errors';
import { FileTransportInfo } from '../fileModel';
import { success, fail, Failure, PromiseResult, Result } from '../result';
import { RemoteConnection } from './remoteConnection';
import path from 'path';

export class Ftp {
  #connectionInformation: RemoteConnection;
  constructor(connectionConfig: RemoteConnection) {
    this.#connectionInformation = connectionConfig;
    this.client = new ftp.Client();
  }
  client: ftp.Client;
  get connected() {
    return !this.client.closed;
  }
  async #init() {
    this.client.ftp.verbose = true;
    try {
      const ftpResponse = await this.client.access({
        host: this.#connectionInformation.serverURL,
        user: this.#connectionInformation.userId,
        password: this.#connectionInformation.password,
        port: this.#connectionInformation.port,
        secure: this.#connectionInformation.sslEnabled
          ? this.#connectionInformation.sslImplicit
            ? 'implicit'
            : true
          : false,
        secureOptions: !this.#connectionInformation.sslEnabled
          ? undefined
          : {
              host: this.#connectionInformation.serverURL,
              port: this.#connectionInformation.port,
              checkServerIdentity: (
                hostname: string,
                cert: PeerCertificate
              ) => {
                return undefined;
              },
            },
      });
      return success(true);
    } catch (err) {
      return new Failure(
        new NetworkError('Fail to do ftp conneciton', err as Error)
      );
    }
  }

  async download(transportInformation: FileTransportInfo) {
    if (!this.connected) {
      const result = await this.#init();
      if (result.isFailure()) return result;
    }

    try {
      if (!transportInformation.isSourceDirectory)
        await this.client.downloadTo(
          transportInformation.destinationFullName,
          transportInformation.sourceFullName.replace(path.sep, '/')
        );
      else
        await this.client.downloadToDir(
          transportInformation.destinationPath,
          transportInformation.sourceFolderName.replace(path.sep, '/')
        );
      return success(true);
    } catch (err) {
      return new Failure(
        new NetworkError('Fail to do ftp download', err as Error)
      );
    }
  }

  async upload(transportInformation: FileTransportInfo) {
    if (!this.connected) {
      const result = await this.#init();
      if (result.isFailure()) return result;
    }

    try {
      if (!transportInformation.isSourceDirectory)
        await this.client.uploadFrom(
          transportInformation.sourceFullName,
          transportInformation.destinationFullName.replace(path.sep, '/')
        );
      else
        await this.client.uploadFromDir(
          transportInformation.sourceFullName,
          transportInformation.destinationFullName.replace(path.sep, '/')
        );
      return success(true);
    } catch (err) {
      return new Failure(
        new NetworkError('Fail to do ftp upload', err as Error)
      );
    }
  }

  async getFileInfo(transportInformation: FileTransportInfo) {
    if (!this.connected) {
      const result = await this.#init();
      if (result.isFailure()) return result;
    }
    const fullPath =
      transportInformation.sourceFullName ?? ''.replace(path.sep, '/');
    try {
      const size = await this.client.size(fullPath);
      const lastModifiedDate = await this.client.lastMod(fullPath);
      return success({ size: size, date: lastModifiedDate });
    } catch (err) {
      return new Failure(
        new NetworkError('Fail to get ftp file information', err as Error)
      );
    }
  }

  async listFiles(transportInformation: FileTransportInfo) {
    if (!this.connected) {
      const result = await this.#init();
      if (result.isFailure()) return result;
    }
    const fullPath =
      transportInformation.sourceFullName ?? ''.replace(path.sep, '/');
    try {
      const fileInfoList = await this.client.list(fullPath);
      return success(fileInfoList.map((f) => f.name));
    } catch (err) {
      return new Failure(
        new NetworkError('Fail to retrieve ftp folders', err as Error)
      );
    }
  }

  close(): Result<boolean, NetworkError> {
    if (!this.connected) return success(true);
    try {
      this.client.close();
      return success(true);
    } catch (err) {
      return new Failure(
        new NetworkError('Fail to close ftp connection', err as Error)
      );
    }
  }
}
