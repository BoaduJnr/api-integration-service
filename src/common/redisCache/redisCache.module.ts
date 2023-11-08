import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { RedisClientOptions } from 'redis';
import { RedisCacheService } from './redisCache.service';
@Global()
@Module({
  imports: [
    CacheModule.register<RedisClientOptions>({
      store: redisStore,
      socket: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379'),
      },
    }),
  ],

  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class AppCacheModule {}
