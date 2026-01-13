import { ConfigService } from '@nestjs/config';
import pino from 'pino';

export function createPinoLogger(config: ConfigService) {
  const env = config.get<string>('app.environment') ?? 'development';
  const isProd = env === 'production';

  const pretty = (config.get<boolean>('logging.pretty') ?? true) && !isProd;
  

  return pino({
    level: config.get<string>('logging.level') ?? 'info',
    base: {
      app: config.get<string>('app.name') ?? 'app',
      version: config.get<string>('app.version') ?? '0.0',
      env,
    },
    transport: pretty
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  });
}
