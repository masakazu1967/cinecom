import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './AppModule';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // グローバルバリデーションパイプ設定
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS設定
  app.enableCors({
    origin: ['http://localhost:3000'], // フロントエンドURL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // APIプレフィックス設定
  app.setGlobalPrefix('api/v1');

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);

  console.log(`🚀 Scene Service is running on: http://localhost:${port}/api/v1`);
}
void bootstrap();
