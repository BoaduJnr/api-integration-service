import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as compression from 'compression';
import { VersioningType } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1.0.0',
  });
  app.setGlobalPrefix('api');
  app.use(compression());
  app.use(helmet());
  await app.listen(process.env.PORT);
}
bootstrap();
