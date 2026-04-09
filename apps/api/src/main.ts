import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix for all routes: /api/v1/...
  app.setGlobalPrefix('api/v1');

  // Auto-validate incoming request bodies (activated when DTOs are added)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Allow frontend to call the API during development
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`ISAC API running on http://localhost:${port}/api/v1`);
}

bootstrap();
