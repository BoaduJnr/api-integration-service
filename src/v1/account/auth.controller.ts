import {
  Body,
  Controller,
  Get,
  Logger,
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
  constructor(
    private authService: AuthService,
    private logger: Logger,
  ) {
    this.logger.log(AuthController.name);
  }

  @Post('register')
  async createAccount(
    @Body(new ValidationPipe({ whitelist: true })) data: CreateAccountDTO,
  ) {
    return this.authService.createAccount(data);
  }
  @Get('verifyKey')
  async verifyAPIKey(@APIKey('x-api-key') apiKey: string) {
    return this.authService.getAPIKey({ apiKey });
  }
  @Get(':organizationId')
  async getAccount(
    @Param(new ValidationPipe({ whitelist: true })) data: OrganizationIdDTO,
  ) {
    return this.authService.getAccount(data);
  }
  @Patch('deactivate/:organizationId')
  async deactivateAccount(
    @Param(new ValidationPipe({ whitelist: true })) where: OrganizationIdDTO,
  ) {
    const deactivateAt = new Date(Date.now());
    return this.authService.updateAccount(where, {
      deactivated: true,
      deactivateAt,
    });
  }
  @Post('apikey/generate/:organizationId')
  async generateAPIKey(
    @Param(new ValidationPipe({ whitelist: true })) data: OrganizationIdDTO,
  ) {
    return this.authService.createAPIKey(data.organizationId);
  }
  @Patch('apikey/deactivate')
  async deactivateAPIKey(
    @Body(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    )
    data: DeactivateAPIKeyDTO,
  ) {
    return this.authService.updateAPIKey(
      { apiKey: data.apiKey },
      { deactivateAt: data.date },
    );
  }
}
