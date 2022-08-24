// import FtpClient from 'ftp';
// import fs from 'fs';
// import { PeerCertificate } from 'tls';
// import { NetworkError } from '../errors';
// import { FileTransportInfo } from '../fileModel';
// import { success, fail, Failure, PromiseResult, Result } from '../result';
// import { RemoteConnection } from './remoteConnection';
// import path from 'path';

// export class Ftp {
//   #connectionInformation: RemoteConnection;
//   constructor(connectionConfig: RemoteConnection) {
//     this.#connectionInformation = connectionConfig;
//     this.client = new FtpClient();
//     this.isConnected = false;
//   }
//   client: FtpClient;
//   isConnected: boolean;
//   async #init(): PromiseResult<boolean, NetworkError> {
//     return new Promise((resolve, reject) => {
//       const errProcess = (err: Error) => {
//         resolve(new Failure(new NetworkError('FTP connection Error', err)));
//       };
//       this.client.on('ready', () => {
//         this.isConnected = true;
//         this.client.off('error', errProcess);
//         resolve(success(true));
//       });
//       this.client.once('error', errProcess);

//       const ftpOptions: FtpClient.Options = {
//         host: this.#connectionInformation.serverURL,
//         port: this.#connectionInformation.port,
//         user: this.#connectionInformation.userId,
//         password: this.#connectionInformation.password,
//         secure: this.#connectionInformation.sslEnabled,
//         secureOptions: !this.#connectionInformation.sslEnabled
//           ? undefined
//           : {
//               host: this.#connectionInformation.serverURL,
//               port: this.#connectionInformation.port,
//               checkServerIdentity: (
//                 hostname: string,
//                 cert: PeerCertificate
//               ) => {
//                 return undefined;
//               },
//             },
//       };
//       this.client.connect(ftpOptions);
//     });
//   }

//   async download(transportInformation: FileTransportInfo) {
//     let result;
//     if (!this.isConnected) {
//       result = await this.#init();
//       if (result.isFailure()) return result;
//       if (!result.value) return result;
//     }

//     result = await new Promise<Result<boolean, NetworkError>>(
//       (resolve, reject) => {
//         //if(isBinary)
//         {
//           this.client.binary(async (err: Error) => {
//             if (err)
//               resolve(
//                 new Failure(new NetworkError('Fail to set binary mode', err))
//               );
//             this.client.get(
//               transportInformation.sourceFullName.replace(path.sep, '/'),
//               (err, stream) => {
//                 if (err)
//                   resolve(
//                     new Failure(
//                       new NetworkError(
//                         `Fail to download file ${transportInformation.sourceFileName}`,
//                         err
//                       )
//                     )
//                   );
//                 stream.on('error', (err) => {
//                   resolve(
//                     new Failure(
//                       new NetworkError(
//                         `Fail to download file ${transportInformation.sourceFileName}`,
//                         err as Error
//                       )
//                     )
//                   );
//                 });
//                 stream.once('close', () => {
//                   this.client.end();
//                   resolve(success(true));
//                 });
//                 stream.pipe(
//                   fs.createWriteStream(transportInformation.destinationFullName)
//                 );
//               }
//             );
//           });
//         }
//       }
//     );
//     return result;
//   }

//   async upload(transportInformation: FileTransportInfo) {
//     let result;
//     if (!this.isConnected) {
//       result = await this.#init();
//       if (result.isFailure()) return result;
//       if (!result.value) return result;
//     }
//     result = await new Promise<Result<boolean, NetworkError>>(
//       (resolve, reject) => {
//         //if(isBinary)
//         {
//           this.client.binary(async (err: Error) => {
//             if (err)
//               resolve(
//                 new Failure(new NetworkError('Fail to set binary mode', err))
//               );
//             this.client.put(
//               transportInformation.sourceFullName,
//               transportInformation.destinationFullName,
//               (err) => {
//                 if (err)
//                   resolve(
//                     new Failure(
//                       new NetworkError(
//                         `Fail to upload file ${transportInformation.sourceFileName}`,
//                         err
//                       )
//                     )
//                   );
//                 resolve(success(true));
//               }
//             );
//           });
//         }
//       }
//     );
//     return result;
//   }
//   async getFileInfo(transportInformation: FileTransportInfo) {
//     let result;
//     if (!this.isConnected) {
//       result = await this.#init();
//       if (result.isFailure()) return result;
//     }

//     let result2 = await new Promise<
//       Result<{ size: number; date: Date }, NetworkError>
//     >((resolve, reject) => {
//       //if(isBinary)
//       {
//         this.client.list(
//           transportInformation.sourceFolderName ?? ''.replace(path.sep, '/'),
//           (err: Error, listing) => {
//             if (err)
//               resolve(
//                 new Failure(
//                   new NetworkError('Fail to retrieve file information', err)
//                 )
//               );
//             for (var information of listing) {
//               if (
//                 information.name.toUpperCase() !==
//                 transportInformation.sourceFileName.toUpperCase()
//               )
//                 continue;
//               resolve(
//                 success({ size: information.size, date: information.date })
//               );
//               return;
//             }
//           }
//         );
//       }
//     });
//     return result2;
//   }

//   async listFiles(transportInformation: FileTransportInfo) {
//     let result;
//     if (!this.isConnected) {
//       result = await this.#init();
//       if (result.isFailure()) return result;
//     }

//     let result2 = await new Promise<Result<string[], NetworkError>>(
//       (resolve, reject) => {
//         //if(isBinary)
//         {
//           this.client.list(
//             transportInformation.sourceFolderName ?? ''.replace(path.sep, '/'),
//             (err: Error, listing) => {
//               if (err)
//                 resolve(
//                   new Failure(
//                     new NetworkError('Fail to retrieve file information', err)
//                   )
//                 );
//               const files = new Array<string>();
//               for (var information of listing) {
//                 files.push(information.name);
//               }
//               resolve(success(files));
//             }
//           );
//         }
//       }
//     );
//     return result2;
//   }

//   async close() {
//     return new Promise<Result<boolean, NetworkError>>((resolve, reject) => {
//       if (!this.isConnected) {
//         return;
//       }
//       this.client.once('error', (err) => {
//         resolve(
//           new Failure(new NetworkError('Fail to disconnect', err as Error))
//         );
//       });
//       this.client.on('end', () => {
//         this.isConnected = false;
//         resolve(success(true));
//       });
//       this.client.end();
//     });
//   }
// }
