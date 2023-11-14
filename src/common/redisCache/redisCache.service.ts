import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisCacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private logger: Logger,
  ) {
    this.logger.log(RedisCacheService.name);
  }

  async get<T>(key: string): Promise<T | null> {
    const cachedData = await this.cacheManager.get<string>(key);

    if (!cachedData) {
      return null;
    }

    return JSON.parse(cachedData);
  }

  async set<T>(key: string, data: T, expirationInSeconds = 0): Promise<void> {
    const serializedData = JSON.stringify(data);

    await this.cacheManager.set(key, serializedData, expirationInSeconds);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async clearCache(): Promise<void> {
    // Use with caution: This will clear the entire Redis cache.
    await this.cacheManager.reset();
  }
}
