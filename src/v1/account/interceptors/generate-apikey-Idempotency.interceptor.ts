import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RedisCacheService } from 'src/common/redisCache/redisCache.service';

@Injectable()
export class GenerateApiKeyIdempotencyInterceptor implements NestInterceptor {
  private redisCache: RedisCacheService;
  private logger: Logger;
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.logger.log(GenerateApiKeyIdempotencyInterceptor.name);
    const {
      account: { organizationId },
    }: { account: { organizationId: string } } = context
      .switchToHttp()
      .getRequest();

    const currentDate = new Date(Date.now());
    const formattedDate = currentDate.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const key = `${formattedDate}:generateKey:${organizationId}`;
    this.redisCache.get(key);

    return next.handle().pipe(map((value) => (value === null ? '' : value)));
  }
}
