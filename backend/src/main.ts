import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter.js';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // ── Global Exception Filter: returns clean JSON errors to Postman/frontend ──
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ── Global Logging Interceptor: logs every request with response time ──
  app.useGlobalInterceptors(new LoggingInterceptor());

  // ── Global Validation Pipe: returns 400 Bad Request on invalid body ──
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
  }));

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://hurdle-frontend-ewnp.onrender.com',
    ],
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`🚀 Server running on http://localhost:${port}/api`);
}
await bootstrap();
