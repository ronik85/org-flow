import type { Logger } from 'pino';

let _logger: Logger;

export const setLogger = (logger: Logger) => {
  _logger = logger;
};

export const logger = {
  info: (obj: any, msg?: string) => _logger.info(obj, msg),
  warn: (obj: any, msg?: string) => _logger.warn(obj, msg),
  error: (obj: any, msg?: string) => _logger.error(obj, msg),
  debug: (obj: any, msg?: string) => _logger.debug(obj, msg),
};
