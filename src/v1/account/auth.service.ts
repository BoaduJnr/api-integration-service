import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Account } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}
  async createAccount(
    data: Prisma.AccountCreateInput,
  ): Promise<Account | null> {
    return this.prismaService.account.create({ data });
  }

  async getAccount(
    where: Prisma.AccountWhereUniqueInput,
  ): Promise<Account | null> {
    return this.prismaService.account.findUnique({
      where,
      include: { Oauth2: true, revoke: true },
    });
  }

  async addOauthToAccount(data: Prisma.OauthTokenCreateInput) {
    return this.prismaService.oauthToken.create({ data });
  }
  async generateAPIKey(data: Prisma.APIKeyCreateInput) {
    return this.prismaService.aPIKey.create({ data });
  }
  async deactivateAPIKey(
    where: Prisma.APIKeyWhereUniqueInput,
    data: Prisma.APIKeyUpdateInput,
  ) {
    return this.prismaService.aPIKey.update({ where, data });
  }
}
