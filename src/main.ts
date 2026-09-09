import 'dotenv/config'; // Load .env before anything else
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe — enforces all DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,             // Strip unknown properties
      forbidNonWhitelisted: true,  // Throw on unknown properties
      transform: true,             // Auto-transform types (e.g., string to number)
    }),
  );

  // CORS — allow all origins in dev, lock down in production
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Global API prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Hurdle Backend running on: http://localhost:${port}/api`);
  console.log(`Server is running on port ${port}`);
}
bootstrap();
