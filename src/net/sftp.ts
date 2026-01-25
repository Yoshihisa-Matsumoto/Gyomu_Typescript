import sftp from 'ssh2-sftp-client';
import { RemoteConnection } from './remoteConnection';

import {  okAsync, Result, ResultAsync ,ok,err} from '../result';
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
  #init(): ResultAsync<boolean, NetworkError> {
    return ResultAsync.fromPromise(
      (async () => {
        await this.client.connect({
          host: this.#config.serverURL,
          username: this.#config.userId,
          port: this.#config.port,
          password: !!this.#config.privateKeyFilename
            ? undefined
            : this.#config.password,
          privateKey: !!this.#config.privateKeyFilename
            ? platform.readFileSync(this.#config.privateKeyFilename)
            : undefined,
          passphrase: !!this.#config.privateKeyFilename
            ? this.#config.password
            : undefined,
        });
        this.connected = true;
        return true;
      })(),
      (err) =>
        err instanceof NetworkError
          ? err
          : new NetworkError('Fail to do SFTP connection', err as Error)
    );
  }

  download(
    transportInformation: FileTransportInfo
  ): ResultAsync<boolean, NetworkError> {
    const initResult = this.connected
      ? okAsync(true)
      : this.#init(); // ResultAsync<boolean, NetworkError>

    return initResult.andThen(() => {
      const promise: Promise<void> = transportInformation.isSourceDirectory
        ? this.client.downloadDir(
            transportInformation.sourceFolderName.replace(platform.sep, '/'),
            transportInformation.destinationPath
          ).then(() =>undefined)
        : this.client.get(
            transportInformation.sourceFullName.replace(platform.sep, '/'),
            transportInformation.destinationFullName
          ).then((stream) =>undefined);

      return ResultAsync.fromPromise(
        promise.then(() => true),
        (err) => new NetworkError('Fail to do SFTP download', err as Error)
      );
    });
  }

  upload(
    transportInformation: FileTransportInfo
  ): ResultAsync<boolean, NetworkError> {
    const initResult = this.connected
      ? okAsync(true)
      : this.#init(); // ResultAsync<boolean, NetworkError>

    return initResult.andThen(() => {
      const promise: Promise<string> = transportInformation.isSourceDirectory
        ? this.client.uploadDir(
            transportInformation.sourceFullName,
            transportInformation.destinationFullName.replace(platform.sep, '/')
          )
        : this.client.put(
            transportInformation.sourceFullName,
            transportInformation.destinationFullName.replace(platform.sep, '/')
          );

      return ResultAsync.fromPromise(
        promise.then(() => true),
        (err) => new NetworkError('Fail to do SFTP upload', err as Error)
      );
    });
  }

  getFileInfo(
    transportInformation: FileTransportInfo
  ): ResultAsync<{ size: number; date: Date }, NetworkError> {
    const initResult = this.connected
      ? okAsync(true)
      : this.#init(); // ResultAsync<boolean, NetworkError>

    return initResult.andThen(() => {
      const fullPath =
        (transportInformation.sourceFullName ?? '').replace(platform.sep, '/');

      return ResultAsync.fromPromise(
        this.client.stat(fullPath).then((stat) => ({
          size: stat.size,
          date: new Date(stat.modifyTime),
        })),
        (err) => new NetworkError('Fail to get SFTP file information', err as Error)
      );
    });
  }
  listFiles(
    transportInformation: FileTransportInfo
  ): ResultAsync<string[], NetworkError> {
    // 接続済みなら okAsync(true)、未接続なら #init()
    const initResult = this.connected ? okAsync(true) : this.#init();

    return initResult.andThen(() => {
      const fullPath = (transportInformation.sourceFullName ?? '').replace(
        platform.sep,
        '/'
      );

      return ResultAsync.fromPromise(
        this.client.list(fullPath).then((fileInfoList) =>
          fileInfoList.map((f) => f.name)
        ),
        (err) =>
          new NetworkError('Fail to retrieve SFTP folders', err as Error)
      );
    });
  }

  close(): ResultAsync<boolean, NetworkError> {
    if (!this.connected) return okAsync(true);

    return ResultAsync.fromPromise(
      this.client.end().then(() => {
        this.connected = false;
        return true;
      }),
      (err) =>
        new NetworkError('Fail to close SFTP connection', err as Error)
    );
  }
}
