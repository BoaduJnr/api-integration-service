import { Module } from '@nestjs/common';
import { AuthModule } from './v1/account/auth.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
