import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Account } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}
  async createAccount(
    data: Prisma.AccountCreateInput,
  ): Promise<Account | null> {
    return this.prismaService.account.create({ data });
  }

  async findAccount(
    where: Prisma.AccountWhereUniqueInput,
  ): Promise<Account | null> {
    return this.prismaService.account.findUnique({
      where,
      include: { Oauth2: true, revoke: true },
    });
  }

  async addAccountOauth(data: Prisma.OauthTokenCreateInput){
    return this.prismaService.oauthToken.create({data})
  }
}
