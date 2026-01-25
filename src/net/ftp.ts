import { Client } from 'basic-ftp';
import { PeerCertificate } from 'tls';
import { NetworkError } from '../errors';
import { FileTransportInfo } from '../fileModel';
import {  okAsync, Result, ResultAsync ,ok,err} from '../result';
import { RemoteConnection } from './remoteConnection';
import { platform } from '../platform';


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
     return ResultAsync.fromPromise(
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
              checkServerIdentity: (
                hostname: string,
                cert: PeerCertificate
              ) => {
                return undefined;
              },
            },
      }),
      (err) => new NetworkError('Fail to do ftp connection', err as Error)
    ).map(() => true);
    
  }

  download(
    transportInformation: FileTransportInfo
  ): ResultAsync<boolean, NetworkError> {
    // #init() が必要な場合は ResultAsync チェーンに含める
    const initResult: ResultAsync<boolean, NetworkError> = this.connected
      ? okAsync<boolean, NetworkError>(true)
      : this.#init(); // #init() は ResultAsync<boolean, NetworkError>

    return initResult.andThen(() => {
      const promise = transportInformation.isSourceDirectory
        ? this.client.downloadToDir(
            transportInformation.destinationPath,
            transportInformation.sourceFolderName.replace(platform.sep, '/')
          )
        : this.client.downloadTo(
            transportInformation.destinationFullName,
            transportInformation.sourceFullName.replace(platform.sep, '/')
          ).then(() => undefined);

      return ResultAsync.fromPromise(
        promise,
        (err) => new NetworkError('Fail to do ftp download', err as Error)
      ).map(() => true);
    });
  }
  upload(transportInformation: FileTransportInfo) {
    const initResult: ResultAsync<boolean, NetworkError> = this.connected
      ? okAsync<boolean, NetworkError>(true)
      : this.#init(); // #init() は ResultAsync<boolean, NetworkError>
    
    return initResult.andThen(() => {
      const promise = transportInformation.isSourceDirectory
        ? this.client.uploadFrom(
           transportInformation.sourceFullName,
           transportInformation.destinationFullName.replace(platform.sep, '/')
          ).then(() => undefined)
        : this.client.uploadFromDir(
            transportInformation.sourceFullName,
            transportInformation.destinationFullName.replace(platform.sep, '/')
          );

      return ResultAsync.fromPromise(
        promise,
        (err) => new NetworkError('Fail to do ftp upload', err as Error)
      ).map(() => true);
    });
  }

  getFileInfo(transportInformation: FileTransportInfo) {
    const initResult: ResultAsync<boolean, NetworkError> = this.connected
      ? okAsync<boolean, NetworkError>(true)
      : this.#init(); // #init() は ResultAsync<boolean, NetworkError>

    const fullPath =
      transportInformation.sourceFullName ?? ''.replace(platform.sep, '/');
    
    const sizePromise = this.client.size(fullPath);
    const lastModPromise = this.client.lastMod(fullPath);

    return ResultAsync.fromPromise(
      Promise.all([sizePromise, lastModPromise]),
      (err) => new NetworkError('Fail to get ftp file information', err as Error)
    ).map(([size, date]) => ({ size, date }));
  }

  listFiles(transportInformation: FileTransportInfo) {
    const initResult: ResultAsync<boolean, NetworkError> = this.connected
      ? okAsync<boolean, NetworkError>(true)
      : this.#init(); // #init() は ResultAsync<boolean, NetworkError>

    const fullPath =
      transportInformation.sourceFullName ?? ''.replace(platform.sep, '/');

    const fileInfoListPromise = this.client.list(fullPath);
    return ResultAsync.fromPromise(
      fileInfoListPromise,
      (err) => new NetworkError('Fail to retrieve ftp folders', err as Error)
    ).map((fileInfoList) => fileInfoList.map((f) => f.name));
  }

  close(): Result<boolean, NetworkError> {
    if (!this.connected) return ok(true);
    try {
      this.client.close();
      return ok(true);
    } catch (error) {
      return err(
        new NetworkError('Fail to close ftp connection', error as Error)
      );
    }
  }
}
