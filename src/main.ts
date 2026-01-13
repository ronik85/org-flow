import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { createPinoLogger } from './common/logger/pino.logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', { infer: true });
  const logger = createPinoLogger(configService);

  app.useLogger({
    log: (msg) => logger.info(msg),
    error: (msg, trace) => logger.error({ trace }, msg),
    warn: (msg) => logger.warn(msg),
    debug: (msg) => logger.debug(msg),
    verbose: (msg) => logger.trace(msg),
  });
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ResponseTransformInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.listen(port);
  console.log(`🚀 Server running on port ${port}`);
}
bootstrap();
