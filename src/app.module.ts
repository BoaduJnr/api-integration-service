import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './v1/account/auth.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { AppCacheModule } from './common/redisCache/redisCache.module';
import { MailModule } from './common/mail/mail.module';
import { APP_FILTER } from '@nestjs/core';
import { ExceptionHandlerFilter } from './exception-filters';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    AppCacheModule,
    AuthModule,
    PrismaModule,
    AppModule,
    MailModule,
  ],
  controllers: [],
  providers: [
    Logger,
    {
      provide: APP_FILTER,
      useClass: ExceptionHandlerFilter,
    },
  ],
})
export class AppModule {}
