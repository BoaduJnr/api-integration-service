import { Logger, Module } from '@nestjs/common';
import { GenerateAPIKey } from './apikey.service';

@Module({
	exports: [GenerateAPIKey],
	providers: [Logger, GenerateAPIKey],
})
export class ApiKeyModule {}
