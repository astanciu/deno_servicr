import * as log from 'https://deno.land/std/log/mod.ts';
export { Logger } from 'https://deno.land/std/log/logger.ts';

class ServiceLogger {
  public name: string;

  constructor() {
    this.setup();
  }

  async setup() {
    await log.setup({
      handlers: {
        console: new log.handlers.ConsoleHandler('DEBUG', {
          formatter: logRecord => {
            let msg = `[${this.name}] ${logRecord.msg}`;

            logRecord.args.forEach((arg, index) => {
              msg += `, arg${index}: ${arg}`;
            });

            return msg;
          }
        })
      },

      loggers: {
        default: {
          level: 'DEBUG',
          handlers: ['console']
        }
      }
    });
  }

  setName(name) {
    this.name = name;
  }

  getLogger() {
    return log.getLogger();
  }
}

export const LoggerFactory = new ServiceLogger();
