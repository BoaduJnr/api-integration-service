import { Logger, Module } from '@nestjs/common';
import { HashService } from './hash.service';

@Module({
	exports: [HashService],
	providers: [HashService, Logger],
})
export class HasHModule {}
