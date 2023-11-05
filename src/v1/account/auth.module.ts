import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { GenerateAPIKey } from './apikey.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [AuthService, GenerateAPIKey],
  controllers: [AuthController],
})
export class AuthModule {}
