import { hostname, networkInterfaces } from 'os';
import { pid, env } from 'process';
import { UserFactory, User } from './user';

//const GYOMU_COMMON_MODE: string = 'GYOMU_COMMON_MODE';
export interface Configurator {
  readonly machineName: string;
  readonly address: string;
  readonly userId: string;
  readonly uniqueInstanceIdPerMachine: number;
  readonly region: string;
  readonly user: User;
  readonly mode: string;
  applicationId: () => number;
  setApplicationId: (id: number) => void;
}

class BaseConfigurator implements Configurator {
  readonly user: User;
  readonly userId: string;
  readonly machineName: string;
  readonly address: string;

  readonly uniqueInstanceIdPerMachine: number;
  readonly region: string;
  readonly mode: string;

  constructor(user: User, applicationId: number = -1) {
    this.user = user;
    this.userId = user.userId;
    this.machineName = hostname();

    const nets = networkInterfaces();
    const net = nets['en0']?.find((v) => v.family === 'IPv4');
    this.address = net ? net.address : '';
    this.#applicationId = applicationId;
    this.uniqueInstanceIdPerMachine = pid;
    this.region = this.user.region;
    this.mode = env.GYOMU_COMMON_MODE || 'Development';
  }
  #applicationId: number;
  applicationId = () => {
    return this.#applicationId;
  };
  setApplicationId = (id: number) => {
    this.#applicationId = id;
  };
}

export class ConfigurationFactory {
  static #config: Configurator;

  static getInstance = (): Configurator => {
    if (!ConfigurationFactory.#config) {
      ConfigurationFactory.#config = new BaseConfigurator(
        UserFactory.getCurrentUser()
      );
    }
    return ConfigurationFactory.#config;
  };
}
