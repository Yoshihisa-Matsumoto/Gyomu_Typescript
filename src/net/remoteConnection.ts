export class RemoteConnection {
  serverURL: string = '';
  port: number = 21;
  userId: string = '';
  password?: string;
  privateKeyFilename?: string;

  // proxyHost: string = '';
  // proxyPort: number = -1;
  // proxyUserID: string = '';
  // proxyPassword: string = '';

  isPassive?: boolean;
  sslEnabled?: boolean;
  sslImplicit?: boolean;

  // setProxy(
  //   proxyHost: string,
  //   proxyPort: number,
  //   proxyUser: string,
  //   proxyPassword: string
  // ) {
  //   this.proxyHost = proxyHost;
  //   this.proxyPort = proxyPort;
  //   this.proxyUserID = proxyUser;
  //   this.proxyPassword = proxyPassword;
  // }
  setSsl(isImplicit: boolean) {
    this.sslEnabled = true;
    this.sslImplicit = isImplicit;
  }
}
