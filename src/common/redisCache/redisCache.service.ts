import { Injectable } from '@nestjs/common';

@Injectable()
export class RedisCacheService {
  constructor() {}

  async get<T>(key: string): Promise<T | null> {
    const cachedData = await this.client.get(key);

    if (!cachedData) {
      return null;
    }

    return JSON.parse(cachedData);
  }

  async set<T>(
    key: string,
    data: T,
    expirationInSeconds?: number,
  ): Promise<void> {
    const serializedData = JSON.stringify(data);

    if (expirationInSeconds) {
      await this.client.setex(key, expirationInSeconds, serializedData);
    } else {
      await this.client.set(key, serializedData);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async clearCache(): Promise<void> {
    // Use with caution: This will clear the entire Redis cache.
    await this.client.flushdb();
  }
  async deleteByPattern(pattern: string): Promise<number> {
    // Use the SCAN command to find keys matching the pattern
    let cursor = '0';
    let deletedKeys = 0;

    do {
      const [newCursor, keys] = await this.client.scan(
        cursor,
        'MATCH',
        pattern,
      );
      // Delete the keys found in this iteration
      if (keys.length > 0) {
        await this.client.del(...keys);
        deletedKeys += keys.length;
      }

      // Update the cursor for the next iteration
      cursor = newCursor;
    } while (cursor !== '0');

    return deletedKeys;
  }
}

