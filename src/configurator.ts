import { hostname, networkInterfaces } from 'os';
import { pid, env } from 'process';
import { UserFactory, User } from './user';
import { z } from './zod';
import dotenv from 'dotenv';

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
        UserFactory.getCurrentUser(),
      );
    }
    return ConfigurationFactory.#config;
  };
}

export interface ConfigSource {
  get(key: string): string | undefined;
}

export function toEnvKey(key: string) {
  return key.replace(/([A-Z])/g, '_$1').toUpperCase();
}

export function loadConfig<T extends z.ZodRawShape>(
  source: ConfigSource,
  schema: z.ZodObject<T>,
  keyMap?: Record<string, string>,
): z.infer<z.ZodObject<T>> {
  const raw: Record<string, unknown> = {};
  for (const key in schema.shape) {
    const envKey = keyMap?.[key] ?? toEnvKey(key);
    raw[key] = source.get(envKey);
  }
  return schema.parse(raw);
}

export class EnvConfigSource implements ConfigSource {
  constructor() {
    dotenv.config();
  }
  get(key: string): string | undefined {
    return process.env[key];
  }
}
