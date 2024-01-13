import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

type TPayload = {
  organizationId: string;
  email: string;
  permissions: string[];
  role?: string;
  userId?: string;
  system?: boolean;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Missing token');
    }
    let payload: TPayload;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });
    } catch (err) {
      if (err.name == 'TokenExpiredError') {
        throw new UnauthorizedException('Expired token');
      }
      throw new BadRequestException('Invalid token');
    }
    // 💡 We assign the payload to the request object here
    // so that we can access it in our route handlers
    request['account'] = payload;
    // if (
    //   request.params.organizationId &&
    //   !request['account'].organizationId !== request.params.organizationId
    // ) {
    //   throw new UnauthorizedException(
    //     'Access denied. Wrong organization domain',
    //   );
    // }
    if (!request['account'].permissions.includes('manage domain')) {
      throw new UnauthorizedException('Not authorised');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
