import { Logger, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GenerateAPIKey } from './apikey.service';
import { JwtModule } from '@nestjs/jwt';
import { ApiKeyModule } from './utils/apikey/apikey.module';
import { HasHModule } from './utils/hashing/hash.module';
import { HashService } from './utils/hashing/hash.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
    }),
    ApiKeyModule,
    HasHModule,
  ],
  providers: [AuthService, GenerateAPIKey, HashService, Logger],
  controllers: [AuthController],
})
export class AuthModule {}
