import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './v1/account/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppCacheModule } from './common/redisCache/redisCache.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    AppCacheModule,
    AuthModule,
    PrismaModule,
    AppModule,
  ],
  controllers: [],
})
export class AppModule {}
