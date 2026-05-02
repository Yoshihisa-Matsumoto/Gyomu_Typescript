import { ServiceMap } from 'effect';

export class RuntimeContext extends ServiceMap.Service<
  RuntimeContext,
  {
    readonly machineName: string;
    readonly address: string;
    readonly pid: number;
  }
>()('RuntimeContext') {}
