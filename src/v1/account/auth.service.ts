import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Account, APIKey } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { GenerateAPIKey } from './utils/apikey/apikey.service';
import { RedisCacheService } from '../../common/redisCache/redisCache.service';
import { HashService } from './utils/hashing/hash.service';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private apiKeyGenerator: GenerateAPIKey,
    private hash: HashService,
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
    let account: Account;
    try {
      account = await this.redisCache.get<Account>(
        `${where.organizationId}:account`,
      );
      if (account) {
        return account;
      }
      account = await this.prismaService.account.findUnique({
        where,
        include: { apiKeys: true },
      });
    } catch (err) {
      this.logger.log(err);
      throw new InternalServerErrorException('Error getting account');
    }
    if (!account) {
      throw new NotFoundException(
        `Account with ID: ${where.organizationId} not found`,
      );
    }
    await this.redisCache.set(`${where.organizationId}:account`, account);
    return account;
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
      this.logger.log(err);
      throw new InternalServerErrorException('Error updating account');
    }
  }
  async getAccountByValidApiKey(ApiKey: string): Promise<Account> {
    const haskedKey = await this.hash.hashKey(ApiKey);
    let apiKey: APIKey & { account: Account };
    try {
      apiKey = await this.prismaService.aPIKey.findUnique({
        where: { apiKey: haskedKey },
        include: { account: true },
      });
    } catch (err) {
      this.logger.log(err);
      throw new InternalServerErrorException(
        'Error getting valid account using api key',
      );
    }
    if (!apiKey) {
      throw new NotFoundException('Not found');
    }
    if (apiKey?.deactivated) {
      throw new BadRequestException('Api-key deactivated');
    }
    const account: Omit<
      Account & { permissions: string[] },
      'deactivateAt, updatedAt'
    > = {
      ...apiKey.account,
      permissions: ['manage domain'],
    };

    return account;
  }

  async createAPIKey(organizationId: string) {
    try {
      let apiKey = await this.redisCache.get<string>(`${organizationId}:key`);

      if (!apiKey) {
        apiKey = await this.apiKeyGenerator.generateRandomStringWithChecksum();

        const hashedKey = await this.hash.hashKey(apiKey);

        await this.prismaService.aPIKey.updateMany({
          where: { organizationId, deactivated: false },
          data: { deactivated: true, deactivateAt: new Date(Date.now()) },
        });

        await this.prismaService.aPIKey.create({
          data: { apiKey: hashedKey, organizationId },
        });
      }
      await this.redisCache.del(`${organizationId}:account`);
      await this.redisCache.set(`${organizationId}:key`, apiKey, 1000);

      return apiKey;
    } catch (err) {
      console.log(err);
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
}
