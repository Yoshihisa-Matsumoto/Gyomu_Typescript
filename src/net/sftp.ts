import sftp from 'ssh2-sftp-client';
import { RemoteConnection } from './remoteConnection';

import { okAsync, GyomuResultAsync, runAsync } from '../result';
import { NetworkError } from '../errors';
import { FileTransportInfo } from '../fileModel';
import { platform } from '../platform';

export class Sftp {
  #config: RemoteConnection;
  constructor(connectionConfig: RemoteConnection) {
    this.#config = connectionConfig;
    this.client = new sftp();
    this.connected = false;
  }
  client: sftp;

  connected: boolean;
  #init(): GyomuResultAsync<boolean> {
    return runAsync(
      async () => {
        await this.client.connect({
          host: this.#config.serverURL,
          username: this.#config.userId,
          port: this.#config.port,
          password: this.#config.privateKeyFilename
            ? undefined
            : this.#config.password,
          privateKey: this.#config.privateKeyFilename
            ? platform.readFileSync(this.#config.privateKeyFilename)
            : undefined,
          passphrase: this.#config.privateKeyFilename
            ? this.#config.password
            : undefined,
        });
        this.connected = true;
        return true;
      },
      NetworkError,
      'Fail to do SFTP connection',
    );
  }

  download(transportInformation: FileTransportInfo): GyomuResultAsync<boolean> {
    const initResult = this.connected ? okAsync(true) : this.#init(); // ResultAsync<boolean, NetworkError>

    return initResult.andThen(() => {
      const promise = transportInformation.isSourceDirectory
        ? () =>
            this.client
              .downloadDir(
                transportInformation.sourceFolderName.replace(
                  platform.sep,
                  '/',
                ),
                transportInformation.destinationPath,
              )
              .then(() => undefined)
        : () =>
            this.client
              .get(
                transportInformation.sourceFullName.replace(platform.sep, '/'),
                transportInformation.destinationFullName,
              )
              .then(() => undefined);

      return runAsync(promise, NetworkError, 'Fail to do SFTP download').map(
        () => true,
      );
    });
  }

  upload(transportInformation: FileTransportInfo): GyomuResultAsync<boolean> {
    const initResult = this.connected ? okAsync(true) : this.#init(); // ResultAsync<boolean, NetworkError>

    return initResult.andThen(() => {
      const promise = transportInformation.isSourceDirectory
        ? () =>
            this.client.uploadDir(
              transportInformation.sourceFullName,
              transportInformation.destinationFullName.replace(
                platform.sep,
                '/',
              ),
            )
        : () =>
            this.client.put(
              transportInformation.sourceFullName,
              transportInformation.destinationFullName.replace(
                platform.sep,
                '/',
              ),
            );

      return runAsync(promise, NetworkError, 'Fail to do SFTP upload').map(
        () => true,
      );
    });
  }

  getFileInfo(
    transportInformation: FileTransportInfo,
  ): GyomuResultAsync<{ size: number; date: Date }> {
    const initResult = this.connected ? okAsync(true) : this.#init(); // ResultAsync<boolean, NetworkError>

    return initResult.andThen(() => {
      const fullPath = (transportInformation.sourceFullName ?? '').replace(
        platform.sep,
        '/',
      );

      return runAsync(
        () =>
          this.client.stat(fullPath).then((stat) => ({
            size: stat.size,
            date: new Date(stat.modifyTime),
          })),
        NetworkError,
        'Fail to get SFTP file information',
      );
    });
  }
  listFiles(
    transportInformation: FileTransportInfo,
  ): GyomuResultAsync<string[]> {
    // 接続済みなら okAsync(true)、未接続なら #init()
    const initResult = this.connected ? okAsync(true) : this.#init();

    return initResult.andThen(() => {
      const fullPath = (transportInformation.sourceFullName ?? '').replace(
        platform.sep,
        '/',
      );

      return runAsync(
        () =>
          this.client
            .list(fullPath)
            .then((fileInfoList) => fileInfoList.map((f) => f.name)),
        NetworkError,
        'Fail to retrieve SFTP folders',
      );
    });
  }

  close(): GyomuResultAsync<boolean> {
    if (!this.connected) return okAsync(true);

    return runAsync(
      () =>
        this.client.end().then(() => {
          this.connected = false;
          return true;
        }),
      NetworkError,
      'Fail to close SFTP connection',
    );
  }
}
