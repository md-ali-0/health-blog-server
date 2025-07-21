export interface ILogger {
  info(message: string, meta?: unknown): void;
  error(message: string, error?: unknown): void;
  warn(message: string, meta?: unknown): void;
  debug(message: string, meta?: unknown): void;
  child(bindings: Record<string, unknown>): ILogger;
}
