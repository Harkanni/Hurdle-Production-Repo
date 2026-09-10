import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // Validate all incoming request bodies — returns 400 Bad Request instead of crashing
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,       // strip unknown fields
    forbidNonWhitelisted: false,
    transform: true,       // auto-convert types
  }));

  app.enableCors({
    origin: [
      'http://localhost:5173', // Your Vite dev server
      'http://localhost:3000', // Local backend
      'https://hurdle-frontend-ewnp.onrender.com', // Hosted Render website
    ],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
