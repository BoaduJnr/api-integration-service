import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CreateAccountDTO,
  DeactivateAPIKeyDTO,
  OrganizationIdDTO,
} from './dto/auth.dto';
import { APIKey } from './decorators';

@Controller('account')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async createAccount(
    @Body(new ValidationPipe({ whitelist: true })) data: CreateAccountDTO,
  ) {
    return this.authService.createAccount(data);
  }
  @Get('verifyKey')
  async verifyAPIKey(@APIKey('X-API-KEY') apiKey: string) {
    const { organizationId } = await this.authService.getAPIKey({ apiKey });
    return this.authService.getAccount({ organizationId });
  }
  @Get(':organizationId')
  async getAccount(
    @Param(new ValidationPipe({ whitelist: true })) data: OrganizationIdDTO,
  ) {
    return this.authService.getAccount(data);
  }
  @Patch(':organizationId')
  async deactivateAccount(
    @Param(new ValidationPipe({ whitelist: true })) where: OrganizationIdDTO,
  ) {
    return this.authService.updateAccount(where, { deactivated: true });
  }
  @Post('generate/:organizationId')
  generateAPIKey(
    @Param(new ValidationPipe({ whitelist: true })) data: OrganizationIdDTO,
  ) {
    this.authService.createAPIKey(data.organizationId);
  }
  @Patch('deactivate')
  deactivateAPIKey(
    @Body(new ValidationPipe({ whitelist: true })) data: DeactivateAPIKeyDTO,
  ) {
    return this.authService.updateAPIKey(
      { apiKey: data.api_key },
      { deactivatedAt: data.date },
    );
  }
}
