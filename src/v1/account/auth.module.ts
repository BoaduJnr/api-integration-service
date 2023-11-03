import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { APIKey } from 'src/common/helper/apikey/apikey.module';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [APIKey],
})
export class AuthModule {}
