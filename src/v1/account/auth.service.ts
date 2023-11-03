import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Account, APIKey } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}
  async createAccount(
    data: Prisma.AccountCreateInput,
  ): Promise<Account | null> {
    try {
      return await this.prismaService.account.create({ data });
    } catch (err) {
      console.log(err);
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
  async getAPIKey(where: Prisma.APIKeyWhereInput): Promise<APIKey | null> {
    try {
      const API_Key = await this.prismaService.aPIKey.findFirst({
        where,
      });
      if (!API_Key) {
        throw new NotFoundException('Not found');
      }
      if (API_Key?.deactivated) {
        throw new BadRequestException('API key deactivated');
      }
      return API_Key;
    } catch (err) {
      console.log(err);

      throw err;
    }
  }

  async createAPIKey(data: Prisma.APIKeyCreateInput) {
    try {
      return await this.prismaService.aPIKey.create({ data });
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
}
