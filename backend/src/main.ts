import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173', // your Vite dev server
    credentials: true,
  });
  
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
