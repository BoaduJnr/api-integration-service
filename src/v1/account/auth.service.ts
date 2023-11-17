import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma, Account, APIKey } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GenerateAPIKey } from './apikey.service';
import { RedisCacheService } from '../../common/redisCache/redisCache.service';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private apiKeyGenerator: GenerateAPIKey,
    private logger: Logger,
    private redisCache: RedisCacheService,
  ) {
    this.logger.log(AuthService.name);
  }
  async createAccount(
    data: Prisma.AccountCreateInput,
  ): Promise<Account | null> {
    try {
      let account = await this.redisCache.get<Account>(
        `${data.organizationId}:create:account`,
      );
      if (!account) {
        account = await this.prismaService.account.create({ data });
      }
      await this.redisCache.set(
        `${data.organizationId}:create:account`,
        account,
      );

      return account;
    } catch (err) {
      if (err.code === 'P2002') {
        throw new ForbiddenException('Credentials taken');
      }
      throw new InternalServerErrorException('Error creating account');
    }
  }

  async getAccount(
    where: Prisma.AccountWhereUniqueInput,
  ): Promise<Account | null> {
    try {
      let account = await this.redisCache.get<Account>(
        `${where.organizationId}:account`,
      );
      if (account) {
        return account;
      }
      account = await this.prismaService.account.findUnique({
        where,
        include: { apiKeys: true },
      });
      await this.redisCache.set(`${where.organizationId}:account`, account);
      if (!account) {
        throw new NotFoundException('Not found');
      }
      return account;
    } catch (err) {
      throw new InternalServerErrorException('Error getting account');
    }
  }
  async updateAccount(
    where: Prisma.AccountWhereUniqueInput,
    data: Prisma.AccountUpdateInput,
  ): Promise<Account | null> {
    try {
      const account = await this.prismaService.account.update({
        where,
        data,
      });
      await this.redisCache.del(`${where.organizationId}:account`);
      return account;
    } catch (err) {
      throw new InternalServerErrorException('Error updating account');
    }
  }
  async getAccountByValidApiKey(
    where: Prisma.APIKeyWhereUniqueInput,
  ): Promise<Account> {
    try {
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
      const account: Omit<
        Account & { permissions: string[] },
        'deactivateAt, updatedAt'
      > = {
        ...API_Key.account,
        permissions: ['manage domain'],
      };

      return account;
    } catch (err) {
      throw new InternalServerErrorException(
        'Error getting valid account using api key',
      );
    }
  }

  async createAPIKey(organizationId: string) {
    try {
      let savedKey = await this.redisCache.get<APIKey>(`${organizationId}:key`);
      if (!savedKey) {
        const apiKey =
          await this.apiKeyGenerator.generateRandomStringWithChecksum();
        savedKey = await this.prismaService.aPIKey.create({
          data: { apiKey, organizationId },
        });
      }

      this.redisCache.set(`${organizationId}:key`, savedKey, 1000);
      return savedKey;
    } catch (err) {
      throw new InternalServerErrorException('Error creating API key');
    }
  }
  async updateAPIKey(
    where: Prisma.APIKeyWhereUniqueInput,
    data: Prisma.APIKeyUpdateInput,
  ) {
    try {
      const { apiKey, deactivateAt, organizationId } =
        await this.prismaService.aPIKey.update({
          where,
          data,
        });
      await this.redisCache.del(`${organizationId}:key`);
      return {
        apiKey,
        deactivateTime: deactivateAt,
        message: `${
          where.apiKey
        } will be deactivated at ${deactivateAt.toUTCString()}`,
      };
    } catch (err) {
      throw new InternalServerErrorException('Error deactivating API key');
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
      throw new InternalServerErrorException('Cron job failed');
    }
  }
}
