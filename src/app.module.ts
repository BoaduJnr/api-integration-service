import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './v1/account/auth.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.dev.env' }),
    AuthModule,
    PrismaModule,
  ],
  controllers: [],
})
export class AppModule {}
