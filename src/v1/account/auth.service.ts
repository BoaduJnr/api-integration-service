import {
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
        include: { revoke: true },
      });

      if (!account) {
        throw new NotFoundException('Not found');
      }
      return account;
    } catch (err) {
      throw err;
    }
  }
  async getAPIKey(
    where: Prisma.APIKeyWhereUniqueInput,
  ): Promise<APIKey | null> {
    try {
      const API_Key = await this.prismaService.aPIKey.findUnique({
        where,
      });

      if (!API_Key) {
        throw new NotFoundException('Not found');
      }
      return API_Key;
    } catch (err) {
      throw err;
    }
  }

  async generateAPIKey(data: Prisma.APIKeyCreateInput) {
    try {
      return await this.prismaService.aPIKey.create({ data });
    } catch (err) {
      throw err;
    }
  }
  async deactivateAPIKey(
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
