import { GenerateAPIKey } from 'src/common/helper/apikey/apikey.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [GenerateAPIKey],
  exports: [GenerateAPIKey],
})
export class APIKey {}
