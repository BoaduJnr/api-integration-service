import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma, Account } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { GenerateAPIKey } from './apikey.service';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private apiKeyGenerator: GenerateAPIKey,
    private logger: Logger,
  ) {
    this.logger.log(AuthService.name);
  }
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
  async getAPIKey(where: Prisma.APIKeyWhereUniqueInput): Promise<Account> {
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
      const account = { ...API_Key.account, permissions: ['admin'] };
      return account;
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
      const { apiKey, deactivateAt } = await this.prismaService.aPIKey.update({
        where,
        data,
      });

      return {
        apiKey,
        deactivateTime: deactivateAt,
        message: `${
          where.apiKey
        } will be deactivated at ${deactivateAt.toUTCString()}`,
      };
    } catch (err) {
      throw err;
    }
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async triggerDeactivations() {
    try {
      await this.prismaService.$transaction(async (tsx) => {
        const date = new Date(Date.now());
        const apiKeys = await tsx.aPIKey.updateMany({
          where: { deactivateAt: { lte: date }, deactivated: false },
          data: { deactivated: true },
        });
        const accounts = await tsx.account.updateMany({
          where: { deactivateAt: { lte: date }, deactivated: false },
          data: { deactivated: true },
        });

        return [apiKeys, accounts];
      });
    } catch (err) {
      this.logger.log(err);
    }
  }
}
