import { Client } from 'basic-ftp';

import { errAsync, runAsync } from '../result.js';
import { FileTransportInfo } from '../fileModel.js';
import { okAsync, GyomuResultAsync } from '../result.js';
import { RemoteConnection } from './remoteConnection.js';
import { platform } from '../platform/index.js';
import { NetworkError } from '../errors.js';

export class Ftp {
  #connectionInformation: RemoteConnection;
  constructor(connectionConfig: RemoteConnection) {
    this.#connectionInformation = connectionConfig;
    this.client = new Client();
  }
  client: Client;
  get connected() {
    return !this.client.closed;
  }
  #init() {
    this.client.ftp.verbose = true;
    return runAsync(
      () =>
        this.client.access({
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
                checkServerIdentity: () => {
                  return undefined;
                },
              },
        }),
      NetworkError,
      'Fail to do ftp connection',
    ).map(() => true);
  }

  download(transportInformation: FileTransportInfo): GyomuResultAsync<boolean> {
    // #init() が必要な場合は ResultAsync チェーンに含める
    const initResult: GyomuResultAsync<boolean> = this.connected
      ? okAsync(true)
      : this.#init(); // #init() は ResultAsync<boolean, NetworkError>

    return initResult.andThen(() => {
      const promise = transportInformation.isSourceDirectory
        ? () =>
            this.client.downloadToDir(
              transportInformation.destinationPath,
              transportInformation.sourceFolderName.replace(platform.sep, '/'),
            )
        : () =>
            this.client
              .downloadTo(
                transportInformation.destinationFullName,
                transportInformation.sourceFullName.replace(platform.sep, '/'),
              )
              .then(() => undefined);

      return runAsync(promise, NetworkError, 'Fail to do ftp download').map(
        () => true,
      );
    });
  }
  upload(transportInformation: FileTransportInfo): GyomuResultAsync<boolean> {
    const initResult: GyomuResultAsync<boolean> = this.connected
      ? okAsync(true)
      : this.#init(); // #init() は ResultAsync<boolean, NetworkError>

    return initResult.andThen(() => {
      const promise = transportInformation.isSourceDirectory
        ? () =>
            this.client
              .uploadFrom(
                transportInformation.sourceFullName,
                transportInformation.destinationFullName.replace(
                  platform.sep,
                  '/',
                ),
              )
              .then(() => undefined)
        : () =>
            this.client.uploadFromDir(
              transportInformation.sourceFullName,
              transportInformation.destinationFullName.replace(
                platform.sep,
                '/',
              ),
            );

      return runAsync(promise, NetworkError, 'Fail to do ftp upload').map(
        () => true,
      );
    });
  }

  getFileInfo(transportInformation: FileTransportInfo): GyomuResultAsync<{
    size: number;
    date: Date;
  }> {
    const initResult: GyomuResultAsync<boolean> = this.connected
      ? okAsync<boolean, NetworkError>(true)
      : this.#init(); // #init() は ResultAsync<boolean, NetworkError>

    return initResult.andThen(() => {
      const fullPath =
        transportInformation.sourceFullName ?? ''.replace(platform.sep, '/');

      const sizePromise = this.client.size(fullPath);
      const lastModPromise = this.client.lastMod(fullPath);

      return runAsync(
        () => Promise.all([sizePromise, lastModPromise]),
        NetworkError,
        'Fail to get ftp file information',
      ).map(([size, date]) => ({ size, date }));
    });
  }

  listFiles(
    transportInformation: FileTransportInfo,
  ): GyomuResultAsync<string[]> {
    const initResult: GyomuResultAsync<boolean> = this.connected
      ? okAsync(true)
      : this.#init(); // #init() は ResultAsync<boolean, NetworkError>

    return initResult.andThen(() => {
      const fullPath =
        transportInformation.sourceFullName ?? ''.replace(platform.sep, '/');

      const fileInfoListPromise = () => this.client.list(fullPath);
      return runAsync(
        fileInfoListPromise,
        NetworkError,
        'Fail to retrieve ftp folders',
      ).map((fileInfoList) => fileInfoList.map((f) => f.name));
    });
  }

  close(): GyomuResultAsync<boolean> {
    if (!this.connected) return okAsync(true);
    try {
      this.client.close();
      return okAsync(true);
    } catch (error) {
      return errAsync(
        new NetworkError('Fail to close ftp connection', error as Error),
      );
    }
  }
}
