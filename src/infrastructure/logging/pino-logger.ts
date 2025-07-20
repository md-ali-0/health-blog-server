import { injectable } from 'inversify';
import pino from 'pino';
import { config } from '../../config/config';
import { ILogger } from '../../shared/interfaces/logger.interface';

@injectable()
export class PinoLogger implements ILogger {
  private logger: pino.Logger;

  constructor() {
    const pinoOptions: pino.LoggerOptions = {
      level: config.logging.level,
      formatters: {
        level: (label: any) => {
          return { level: label };
        },
      },
      timestamp: pino.stdTimeFunctions.isoTime,
    };

    if (config.server.nodeEnv === 'development') {
      (pinoOptions as any).transport = {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      };
    }

    this.logger = pino(pinoOptions);
  }

  info(message: string, meta?: unknown): void {
    this.logger.info(meta, message);
  }

  error(message: string, error?: unknown): void {
    this.logger.error(error, message);
  }

  warn(message: string, meta?: unknown): void {
    this.logger.warn(meta, message);
  }

  debug(message: string, meta?: unknown): void {
    this.logger.debug(meta, message);
  }

  child(bindings: Record<string, unknown>): ILogger {
    const childLogger = this.logger.child(bindings);
    return {
      info: (message: string, meta?: unknown) => childLogger.info(meta, message),
      error: (message: string, error?: unknown) => childLogger.error(error, message),
      warn: (message: string, meta?: unknown) => childLogger.warn(meta, message),
      debug: (message: string, meta?: unknown) => childLogger.debug(meta, message),
      child: (childBindings: Record<string, unknown>) => this.child(childBindings),
    };
  }
}