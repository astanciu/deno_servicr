import { runner } from './Executor.ts';
import { Logger, LoggerFactory } from './Logger.ts';

type Function = { (ctx?: any): void };
type Functions = { order: number; fn: Function }[];
type ServicrOptions = {
  silent: boolean;
};
export class Servicr {
  private serviceName: string;
  public ctx: any = {};
  private startFunctions: Functions = [];
  private shutdownFunctions: Functions = [];
  public isShuttingDown = false;
  public running = false;
  public log: Logger;
  private options: ServicrOptions = {
    silent: false
  };

  constructor(serviceName = 'SERVICE') {
    this.serviceName = serviceName;
  }

  private setLogger(): void {
    // const loggers = await CreateLoggers(this.serviceName)
    LoggerFactory.setName(this.serviceName);
    this.log = LoggerFactory.getLogger();
  }

  public async init(): Promise<void> {
    this.setLogger();

    window.onunload = (e: Event) => {
      this.exitHandler(e.type);
    };

    const listenSignal = async signal => {
      await Deno.signal(signal);
      console.log(`Got Signal ${signal}`);
      this.exitHandler(`${signal}`);
    };

    // we don't await this
    Promise.all([listenSignal(Deno.Signal.SIGTERM), listenSignal(Deno.Signal.SIGINT)]);
  }

  public onStart(fn: Function, order = Infinity): Servicr {
    this.startFunctions.push({ order, fn });
    return this;
  }

  public setName(name: string): Servicr {
    this.serviceName = name;
    this.setLogger();

    return this;
  }

  private setOptions(options: ServicrOptions): void {
    this.options = { ...this.options, ...options };
  }

  public async start(options?: ServicrOptions): Promise<void> {
    if (this.running) {
      this.log.error('Failed to start, service already running.');
    }
    if (options) this.setOptions(options);

    // this.log.info(`Starting...`);
    // await Promise.all(this.startFunctions.map(fn => fn(this.ctx)));
    await runner(this.startFunctions, this.ctx);
    this.running = true;
    this.log.warning(`Service ready`);
  }

  public onShutdown(fn: Function, order = Infinity): Servicr {
    this.shutdownFunctions.push({ order, fn });
    return this;
  }

  public async shutdown(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }
    this.isShuttingDown = true;

    try {
      await Promise.all(this.shutdownFunctions.map(i => i.fn(this.ctx)));
      this.running = false;
      this.isShuttingDown = false;
      this.log.warning(`Service shutdown`);
      Deno.exit();
    } catch (err) {
      this.log.error(`FATAL: Error while trying to shutdown`, err);
    }
  }

  private async exitHandler(source: string, err?: Error, ...args: any[]): Promise<void> {
    this.log.info(`Shutdown initiated from: ${source}`);
    if (err) {
      this.log.error(err.message, err);
    }

    this.shutdown();
  }
}
