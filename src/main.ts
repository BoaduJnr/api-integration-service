import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as compression from 'compression';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.use(compression());
  app.setGlobalPrefix('api');
  await app.listen(4000);
}
bootstrap();
