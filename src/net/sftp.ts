import { fstat } from 'fs';
import sftp from 'ssh2-sftp-client';
import { RemoteConnection } from './remoteConnection';
import fs from 'fs';
import { Failure, Result, success } from '../result';
import { NetworkError } from '../errors';
import { FileTransportInfo } from '../fileModel';
import path from 'path';

export class Sftp {
  #config: RemoteConnection;
  constructor(connectionConfig: RemoteConnection) {
    this.#config = connectionConfig;
    this.client = new sftp();
    this.connected = false;
  }
  client: sftp;

  connected: boolean;
  async #init() {
    try {
      const ftpResponse = await this.client.connect({
        host: this.#config.serverURL,
        username: this.#config.userId,
        port: this.#config.port,
        password: !!this.#config.privateKeyFilename
          ? undefined
          : this.#config.password,
        privateKey: !!this.#config.privateKeyFilename
          ? fs.readFileSync(this.#config.privateKeyFilename)
          : undefined,
        passphrase: !!this.#config.privateKeyFilename
          ? this.#config.password
          : undefined,
      });
      this.connected = true;
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
        await this.client.get(
          transportInformation.sourceFullName.replace(path.sep, '/'),
          transportInformation.destinationFullName
        );
      else
        await this.client.downloadDir(
          transportInformation.sourceFolderName.replace(path.sep, '/'),
          transportInformation.destinationPath
        );
      return success(true);
    } catch (err) {
      return new Failure(
        new NetworkError('Fail to do sftp download', err as Error)
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
        await this.client.put(
          transportInformation.sourceFullName,
          transportInformation.destinationFullName.replace(path.sep, '/')
        );
      else
        await this.client.uploadDir(
          transportInformation.sourceFullName,
          transportInformation.destinationFullName.replace(path.sep, '/')
        );
      return success(true);
    } catch (err) {
      return new Failure(
        new NetworkError('Fail to do sftp upload', err as Error)
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
      const stat = await this.client.stat(fullPath);
      return success({ size: stat.size, date: new Date(stat.modifyTime) });
    } catch (err) {
      return new Failure(
        new NetworkError('Fail to get sftp file information', err as Error)
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
        new NetworkError('Fail to retrieve sftp folders', err as Error)
      );
    }
  }

  async close() {
    if (!this.connected) return success(true);
    try {
      await this.client.end();
      this.connected = false;
      return success(true);
    } catch (err) {
      return new Failure(
        new NetworkError('Fail to close sftp connection', err as Error)
      );
    }
  }
}
