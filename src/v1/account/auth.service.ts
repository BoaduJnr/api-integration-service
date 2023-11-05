import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma, Account, APIKey } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { GenerateAPIKey } from './apikey.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private prismaService: PrismaService,
    private apiKeyGenerator: GenerateAPIKey,
  ) {}
  async createAccount(
    data: Prisma.AccountCreateInput,
  ): Promise<Account | null> {
    try {
      return await this.prismaService.account.create({ data });
    } catch (err) {
      this.logger.log(err);
      if (err.code === 'P2002') {
        throw new ForbiddenException('Credentials taken');
      }
      throw err;
    }
  }

  async getAccount(
    where: Prisma.AccountWhereUniqueInput,
  ): Promise<Account | null> {
    try {
      const account = await this.prismaService.account.findUnique({
        where,
        include: { apiKeys: true },
      });

      if (!account) {
        throw new NotFoundException('Not found');
      }
      return account;
    } catch (err) {
      throw err;
    }
  }
  async updateAccount(
    where: Prisma.AccountWhereUniqueInput,
    data: Prisma.AccountUpdateInput,
  ): Promise<Account | null> {
    try {
      return await this.prismaService.account.update({
        where,
        data,
      });
    } catch (err) {
      throw err;
    }
  }
  async getAPIKey(
    where: Prisma.APIKeyWhereUniqueInput,
  ): Promise<APIKey | null> {
    try {
      if (!where.apiKey) {
        throw new BadRequestException('Missing api-key');
      }
      const API_Key = await this.prismaService.aPIKey.findUnique({
        where,
        include: { account: true },
      });
      if (!API_Key) {
        throw new NotFoundException('Not found');
      }
      if (API_Key?.deactivated) {
        throw new BadRequestException('Api-key deactivated');
      }
      return API_Key;
    } catch (err) {
      console.log(err);

      throw err;
    }
  }

  async createAPIKey(organizationId: string) {
    try {
      const apiKey = this.apiKeyGenerator.generateRandomStringWithChecksum();
      return await this.prismaService.aPIKey.create({
        data: { apiKey, organizationId },
      });
    } catch (err) {
      throw err;
    }
  }
  async updateAPIKey(
    where: Prisma.APIKeyWhereUniqueInput,
    data: Prisma.APIKeyUpdateInput,
  ) {
    try {
      return await this.prismaService.aPIKey.update({ where, data });
    } catch (err) {
      throw err;
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  triggerDeactivations() {
    try {
      this.prismaService.$transaction(async (tsx) => {
        this.logger.log('Job is running');
        const date = new Date(Date.now());
        await tsx.aPIKey.updateMany({
          where: { deactivateAt: { lte: date } },
          data: { deactivated: true },
        });
        await tsx.account.updateMany({
          where: { deactivateAt: { lte: date } },
          data: { deactivated: true },
        });
      });
    } catch (err) {
      this.logger.log(err);
    }
  }
}
