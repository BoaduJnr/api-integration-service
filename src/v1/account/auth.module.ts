import { Logger, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { GenerateAPIKey } from './apikey.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
    }),
  ],
  providers: [AuthService, GenerateAPIKey, Logger],
  controllers: [AuthController],
})
export class AuthModule {}
