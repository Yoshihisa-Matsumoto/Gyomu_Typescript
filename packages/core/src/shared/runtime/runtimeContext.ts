import { Context } from 'effect';

export class RuntimeContext extends Context.Service<
  RuntimeContext,
  {
    readonly machineName: string;
    readonly address: string;
    readonly pid: number;
  }
>()('RuntimeContext') {}
