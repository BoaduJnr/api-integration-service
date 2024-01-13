import { Injectable, Logger } from '@nestjs/common';
import { pbkdf2Sync } from 'crypto';

@Injectable()
export class HashService {
  private salt = process.env.HASH_SECRET;
  private iterations = +process.env.HASH_ITERATIONS;
  private keylen = +process.env.HASH_KEYLEN;
  private digest = process.env.HASH_ALGO;
  constructor(private logger: Logger) {
    this.logger.log(HashService.name);
  }
  async hashKey(key: string) {
    const hashedKey = pbkdf2Sync(
      key,
      this.salt,
      this.iterations,
      this.keylen,
      this.digest,
    );
    return hashedKey.toString('hex');
  }
}
