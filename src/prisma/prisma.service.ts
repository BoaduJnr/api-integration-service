import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: 'postgresql://api_integration:password123@localhost:5432/api_integration_database?schema=public',
        },
      },
    });
  }
}
